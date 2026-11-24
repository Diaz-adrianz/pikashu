import { randomUUID } from 'crypto';
import path from 'path';
import { Prisma } from '@/generated/prisma/client';
import { ActionError } from '@/lib/action';
import { prisma } from '@/lib/prisma';
import { deleteUploadFile, saveUploadFile } from '@/lib/storage';
import { CreateFacility, UpdateFacility } from './schemas';

const IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const UPLOAD_SUBDIR = 'facilities';

export function validateFacilityImage(input: unknown): File {
  if (!(input instanceof File) || !input.size)
    throw new ActionError('Gambar wajib diunggah');

  if (input.size > MAX_IMAGE_SIZE)
    throw new ActionError('Ukuran gambar maksimal 5 MB');

  const ext = path.extname(input.name).toLowerCase(),
    allowed = IMAGE_TYPES[input.type];
  if (!allowed || !allowed.includes(ext))
    throw new ActionError('Format gambar harus JPEG, PNG, atau WebP');

  return input;
}

export function optionalFacilityImage(input: unknown): File | undefined {
  if (!(input instanceof File) || (!input.name && !input.size))
    return undefined;
  return validateFacilityImage(input);
}

async function storeFacilityImage(input: File): Promise<string> {
  const file = validateFacilityImage(input),
    ext = path.extname(file.name).toLowerCase(),
    filename = `${randomUUID()}${ext}`;
  return saveUploadFile(
    new Uint8Array(await file.arrayBuffer()),
    filename,
    UPLOAD_SUBDIR
  );
}

export async function readFacilities(opts: {
  search?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.FacilityWhereInput = {},
    skip = (opts.page - 1) * opts.limit;

  if (opts.search)
    where.OR = [
      { title: { contains: opts.search, mode: 'insensitive' } },
      { description: { contains: opts.search, mode: 'insensitive' } },
    ];

  const [items, total] = await Promise.all([
    prisma.facility.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.facility.count({ where }),
  ]);

  return { items, total };
}

export async function readFacility(id: string) {
  return prisma.facility.findUnique({ where: { id } });
}

export async function createFacility(data: CreateFacility, image: File) {
  const stored = await storeFacilityImage(image);
  try {
    return await prisma.facility.create({
      data: { ...data, description: data.description ?? '', image: stored },
    });
  } catch (error) {
    deleteUploadFile(stored);
    throw error;
  }
}

export async function updateFacility(
  id: string,
  data: UpdateFacility,
  image?: File
) {
  const facility = await prisma.facility.findUnique({ where: { id } });
  if (!facility) throw new ActionError('Fasilitas tidak ditemukan');

  const stored = image ? await storeFacilityImage(image) : undefined;
  try {
    const updated = await prisma.facility.update({
      where: { id },
      data: {
        ...data,
        ...(data.description !== undefined && {
          description: data.description || '',
        }),
        ...(stored && { image: stored }),
      },
    });
    if (stored) deleteUploadFile(facility.image);
    return updated;
  } catch (error) {
    if (stored) deleteUploadFile(stored);
    throw error;
  }
}

export async function deleteFacility(id: string) {
  const facility = await prisma.facility.findUnique({ where: { id } });
  if (!facility) throw new ActionError('Fasilitas tidak ditemukan');

  const deleted = await prisma.facility.delete({ where: { id } });
  deleteUploadFile(facility.image);
  return deleted;
}
