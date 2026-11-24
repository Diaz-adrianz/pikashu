import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { CreateUser, RegisterUser, UpdateUser } from './schemas';
import { ActionError } from '@/lib/action';

export async function registerUser(data: RegisterUser) {
  return createUser({ ...data, role: 'PASSENGER' });
}

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

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: opts.limit,
      select: { id: true, name: true, email: true, image: true, role: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

export async function readUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: CreateUser) {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new ActionError('Email sudah terdaftar');

  return prisma.user.create({
    data: { ...data, password: await bcrypt.hash(data.password, 12) },
    omit: { password: true },
  });
}

export async function updateUser(id: string, data: UpdateUser) {
  return prisma.user.update({ where: { id }, data, omit: { password: true } });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id }, omit: { password: true } });
}
