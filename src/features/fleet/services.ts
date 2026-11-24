import { randomUUID } from 'crypto';
import path from 'path';
import { Prisma } from '@/generated/prisma/client';
import { FleetStatus } from '@/generated/prisma/enums';
import { ActionError } from '@/lib/action';
import { prisma } from '@/lib/prisma';
import { deleteUploadFile, saveUploadFile } from '@/lib/storage';
import { CreateFleet, UpdateFleet } from './schemas';

const IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const UPLOAD_SUBDIR = 'fleets';

const fleetInclude = {
  images: { orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }] },
} satisfies Prisma.FleetInclude;

export async function readFleets(opts: {
  search?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.FleetWhereInput = {},
    skip = (opts.page - 1) * opts.limit;

  if (opts.search)
    where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { description: { contains: opts.search, mode: 'insensitive' } },
    ];

  const [items, total] = await Promise.all([
    prisma.fleet.findMany({
      where,
      skip,
      take: opts.limit,
      include: { images: { where: { isMain: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.fleet.count({ where }),
  ]);

  return { items, total };
}

export async function readFleet(id: string) {
  return prisma.fleet.findUnique({ where: { id }, include: fleetInclude });
}

export async function createFleet(data: CreateFleet) {
  return prisma.fleet.create({
    data: { ...data, description: data.description || null },
    include: fleetInclude,
  });
}

export async function updateFleet(id: string, data: UpdateFleet) {
  const fleet = await prisma.fleet.findUnique({ where: { id } });
  if (!fleet) throw new ActionError('Armada tidak ditemukan');

  const restricted =
    data.status === 'INACTIVE' ||
    (!!data.seatTier && data.seatTier !== fleet.seatTier);
  if (restricted) {
    const active = await prisma.booking.count({
      where: {
        trip: { fleetId: id },
        status: { in: ['PENDING_PAYMENT', 'PAID'] },
      },
    });
    if (active)
      throw new ActionError(
        'Armada memiliki pemesanan aktif. Selesaikan atau batalkan pemesanan terlebih dahulu.'
      );
  }

  return prisma.fleet.update({
    where: { id },
    data: { ...data, description: data.description || null },
    include: fleetInclude,
  });
}

export async function deleteFleet(id: string) {
  const fleet = await prisma.fleet.findUnique({
    where: { id },
    include: { images: true, _count: { select: { trips: true } } },
  });
  if (!fleet) throw new ActionError('Armada tidak ditemukan');
  if (fleet._count.trips)
    throw new ActionError(
      'Armada pernah digunakan dan tidak dapat dihapus. Nonaktifkan saja.'
    );

  const deleted = await prisma.fleet.delete({ where: { id } });
  fleet.images.forEach((image) => deleteUploadFile(image.path));
  return deleted;
}

export async function addFleetImage(fleetId: string, file: File) {
  const fleet = await prisma.fleet.findUnique({
    where: { id: fleetId },
    include: { images: true },
  });
  if (!fleet) throw new ActionError('Armada tidak ditemukan');

  if (file.size > MAX_IMAGE_SIZE)
    throw new ActionError('Ukuran gambar maksimal 5 MB');

  const ext = path.extname(file.name).toLowerCase(),
    allowed = IMAGE_TYPES[file.type];
  if (!allowed || !allowed.includes(ext))
    throw new ActionError('Format gambar harus JPEG, PNG, atau WebP');

  const filename = `${randomUUID()}${ext}`,
    relative = saveUploadFile(
      new Uint8Array(await file.arrayBuffer()),
      filename,
      UPLOAD_SUBDIR
    );

  return prisma.fleetImage.create({
    data: {
      fleetId,
      path: relative,
      isMain: fleet.images.length === 0,
    },
  });
}

export async function deleteFleetImage(id: string) {
  const image = await prisma.fleetImage.findUnique({ where: { id } });
  if (!image) throw new ActionError('Gambar tidak ditemukan');

  await prisma.$transaction(async (tx) => {
    await tx.fleetImage.delete({ where: { id } });

    if (!image.isMain) return;

    const next = await tx.fleetImage.findFirst({
      where: { fleetId: image.fleetId },
      orderBy: { createdAt: 'asc' },
    });
    if (next)
      await tx.fleetImage.update({
        where: { id: next.id },
        data: { isMain: true },
      });
  });

  deleteUploadFile(image.path);
  return image;
}

export async function setMainFleetImage(id: string) {
  const image = await prisma.fleetImage.findUnique({ where: { id } });
  if (!image) throw new ActionError('Gambar tidak ditemukan');

  return prisma.$transaction(async (tx) => {
    await tx.fleetImage.updateMany({
      where: { fleetId: image.fleetId },
      data: { isMain: false },
    });
    return tx.fleetImage.update({ where: { id }, data: { isMain: true } });
  });
}

export async function setFleetStatus(id: string, status: FleetStatus) {
  return updateFleet(id, { status });
}
