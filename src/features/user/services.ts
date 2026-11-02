import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@/lib/prisma/generated/client';

export async function readUsers(opts: {
  search?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.UserWhereInput = {},
    skip = (opts.page - 1) * opts.limit;
  if (opts.search)
    where['OR'] = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { email: { contains: opts.search, mode: 'insensitive' } },
    ];

  const [items, count] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: opts.limit,
      select: { id: true, name: true, email: true, image: true, role: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, count };
}

export async function readUser(key: { id: string } | { email: string }) {
  const where: Prisma.UserWhereUniqueInput = key;
  const item = await prisma.user.findUnique({ where });
  return item;
}
