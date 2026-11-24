import { Prisma } from '@/generated/prisma/client';
import { OptionalServiceStatus } from '@/generated/prisma/enums';
import { ActionError } from '@/lib/action';
import { prisma } from '@/lib/prisma';
import { CreateService, UpdateService } from './schemas';

export async function readServices(opts: {
  search?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.OptionalServiceWhereInput = {},
    skip = (opts.page - 1) * opts.limit;

  if (opts.search)
    where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { description: { contains: opts.search, mode: 'insensitive' } },
    ];

  const [items, total] = await Promise.all([
    prisma.optionalService.findMany({
      where,
      skip,
      take: opts.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.optionalService.count({ where }),
  ]);

  return { items, total };
}

export async function readService(id: string) {
  return prisma.optionalService.findUnique({ where: { id } });
}

export async function createService(data: CreateService) {
  return prisma.optionalService.create({
    data: {
      ...data,
      description: data.description ?? '',
      capacity: data.capacity ?? null,
    },
  });
}

export async function updateService(id: string, data: UpdateService) {
  const service = await prisma.optionalService.findUnique({ where: { id } });
  if (!service) throw new ActionError('Layanan tidak ditemukan');

  const { description, capacity, ...rest } = data;
  return prisma.optionalService.update({
    where: { id },
    data: {
      ...rest,
      ...(description !== undefined && { description: description || '' }),
      ...(capacity !== undefined && { capacity }),
    },
  });
}

export async function setServiceStatus(
  id: string,
  status: OptionalServiceStatus
) {
  return updateService(id, { status });
}

export async function deleteService(id: string) {
  const [service, tripCount, bookingCount] = await Promise.all([
    prisma.optionalService.findUnique({ where: { id } }),
    prisma.tripOptionalService.count({ where: { serviceId: id } }),
    prisma.bookingOptionalService.count({ where: { serviceId: id } }),
  ]);
  if (!service) throw new ActionError('Layanan tidak ditemukan');
  if (tripCount || bookingCount)
    throw new ActionError(
      'Layanan pernah digunakan dan tidak dapat dihapus. Nonaktifkan layanan ini sebagai gantinya.'
    );

  return prisma.optionalService.delete({ where: { id } });
}
