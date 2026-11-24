import { PrismaClient, Role } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Users seeding...');

  const password = await bcrypt.hash(process.env.SEED_USER_PASSWORD, 12);
  const data: { name: string; email: string; password: string; role: Role }[] =
    [
      {
        name: 'Admin',
        email: 'admin@pikashu.id',
        password,
        role: Role.ADMIN,
      },
      {
        name: 'Staff1',
        email: 'staff1@pikashu.id',
        password,
        role: Role.STAFF,
      },
      {
        name: 'Staff2',
        email: 'staff2@pikashu.id',
        password,
        role: Role.STAFF,
      },
      {
        name: 'Passenger1',
        email: 'passenger1@pikashu.id',
        password,
        role: Role.PASSENGER,
      },
      {
        name: 'Passenger2',
        email: 'passenger2@pikashu.id',
        password,
        role: Role.PASSENGER,
      },
    ];

  let c = 0,
    f = 0;

  for (const dat of data) {
    try {
      const exist = await prisma.user.findUnique({
        where: { email: dat.email },
      });
      if (!exist) {
        await prisma.user.create({ data: dat });
        c++;
      }
    } catch (error) {
      console.error(error);
      f++;
    }
  }
  console.log(`${data.length} data; ${c} created; ${f} failed.`);
}
