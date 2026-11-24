import { Prisma } from '@/generated/prisma/client';
import { RouteStatus } from '@/generated/prisma/enums';
import { ActionError } from '@/lib/action';
import { prisma } from '@/lib/prisma';
import { CreateRoute, UpdateRoute } from './schemas';

const routeInclude = {
  _count: { select: { trips: true } },
} satisfies Prisma.RouteInclude;

function pathInput(path: CreateRoute['path'] | UpdateRoute['path']) {
  if (path === undefined) return undefined;
  return path ?? Prisma.DbNull;
}

export async function readRoutes(opts: {
  search?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.RouteWhereInput = {},
    skip = (opts.page - 1) * opts.limit;

  if (opts.search)
    where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { originCity: { contains: opts.search, mode: 'insensitive' } },
      { destinationCity: { contains: opts.search, mode: 'insensitive' } },
    ];

  const [items, total] = await Promise.all([
    prisma.route.findMany({
      where,
      skip,
      take: opts.limit,
      include: routeInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.route.count({ where }),
  ]);

  return { items, total };
}

export async function readRoute(id: string) {
  return prisma.route.findUnique({ where: { id }, include: routeInclude });
}

export async function createRoute(data: CreateRoute) {
  return prisma.route.create({
    data: { ...data, path: pathInput(data.path) },
    include: routeInclude,
  });
}

export async function updateRoute(id: string, data: UpdateRoute) {
  const route = await prisma.route.findUnique({ where: { id } });
  if (!route) throw new ActionError('Rute tidak ditemukan');

  return prisma.route.update({
    where: { id },
    data: { ...data, path: pathInput(data.path) },
    include: routeInclude,
  });
}

export async function deleteRoute(id: string) {
  const route = await prisma.route.findUnique({
    where: { id },
    include: { _count: { select: { trips: true } } },
  });
  if (!route) throw new ActionError('Rute tidak ditemukan');

  if (route._count.trips > 0)
    throw new ActionError(
      'Rute pernah digunakan, tidak dapat dihapus. Nonaktifkan saja.'
    );

  return prisma.route.delete({ where: { id } });
}

export async function setRouteStatus(id: string, status: RouteStatus) {
  return updateRoute(id, { status });
}
