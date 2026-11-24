import { Prisma } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';
import { ActionError } from '@/lib/action';
import { prisma } from '@/lib/prisma';
import { CreateUser, RegisterUser, UpdateUser } from './schemas';
import { ChangePassword, UpdateProfile } from './profile-schemas';

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
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        status: true,
      },
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

export async function readProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, phone: true },
  });
}

export async function updateProfile(userId: string, data: UpdateProfile) {
  return prisma.user.update({
    where: { id: userId },
    data: { name: data.name, phone: data.phone || null },
    select: { id: true, name: true, email: true, image: true, phone: true },
  });
}

export async function changePassword(userId: string, data: ChangePassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password)
    throw new ActionError('Akun Google tidak dapat mengubah password di sini');
  const ok = await bcrypt.compare(data.currentPassword, user.password);
  if (!ok) throw new ActionError('Password saat ini salah');

  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(data.newPassword, 12) },
  });
}
