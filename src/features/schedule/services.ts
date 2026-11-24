import { addDays, addMinutes, setHours, setMinutes, startOfDay } from 'date-fns';
import { Prisma } from '@/generated/prisma/client';
import { OptionalServiceStatus } from '@/generated/prisma/enums';
import { ActionError } from '@/lib/action';
import { prisma } from '@/lib/prisma';
import { getSeatCapacity } from '@/features/trip/seat-layout';
import { CreateSchedule, UpdateSchedule } from './schemas';

const HORIZON_DAYS = 7;

const scheduleInclude = {
  route: true,
  fleet: { include: { images: { where: { isMain: true }, take: 1 } } },
} satisfies Prisma.ScheduleInclude;

export async function readSchedules(opts: {
  search?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.ScheduleWhereInput = {},
    skip = (opts.page - 1) * opts.limit;

  if (opts.search)
    where.OR = [
      { route: { name: { contains: opts.search, mode: 'insensitive' } } },
      { route: { originCity: { contains: opts.search, mode: 'insensitive' } } },
      { route: { destinationCity: { contains: opts.search, mode: 'insensitive' } } },
      { fleet: { name: { contains: opts.search, mode: 'insensitive' } } },
    ];

  const [items, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      skip,
      take: opts.limit,
      include: {
        ...scheduleInclude,
        _count: { select: { trips: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.schedule.count({ where }),
  ]);
  return { items, total };
}

export async function readSchedule(id: string) {
  return prisma.schedule.findUnique({ where: { id }, include: scheduleInclude });
}

export async function createSchedule(data: CreateSchedule) {
  return prisma.schedule.create({ data, include: scheduleInclude });
}

export async function updateSchedule(id: string, data: UpdateSchedule) {
  const exists = await prisma.schedule.findUnique({ where: { id } });
  if (!exists) throw new ActionError('Jadwal tidak ditemukan');
  return prisma.schedule.update({ where: { id }, data, include: scheduleInclude });
}

export async function deleteSchedule(id: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: { _count: { select: { trips: true } } },
  });
  if (!schedule) throw new ActionError('Jadwal tidak ditemukan');
  if (schedule._count.trips > 0)
    throw new ActionError(
      'Jadwal pernah digunakan dan tidak dapat dihapus. Nonaktifkan saja.'
    );
  return prisma.schedule.delete({ where: { id } });
}

function departureFor(day: Date, time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return setMinutes(setHours(startOfDay(day), hour), minute);
}

/** Idempotent rolling seven-day trip generation. */
export async function generateTrips() {
  const now = new Date();
  const schedules = await prisma.schedule.findMany({
    where: {
      status: 'ACTIVE',
      route: { status: 'ACTIVE' },
      fleet: { status: 'ACTIVE' },
    },
    include: { route: true, fleet: true },
  });

  const [services, facilityGroups] = await Promise.all([
    prisma.optionalService.findMany({
      where: { status: OptionalServiceStatus.ACTIVE },
    }),
    prisma.facility.findMany(),
  ]);

  const days = Array.from({ length: HORIZON_DAYS }, (_, i) =>
    addDays(startOfDay(now), i)
  );
  const plans: Prisma.TripCreateManyInput[] = [];

  for (const schedule of schedules) {
    for (const day of days) {
      const departureAt = departureFor(day, schedule.departureTime);
      if (departureAt <= now) continue;

      const facilities = facilityGroups
        .filter((f) => f.seatTier === schedule.fleet.seatTier)
        .map((f) => ({
          title: f.title,
          description: f.description,
          image: f.image,
        }));

      plans.push({
        scheduleId: schedule.id,
        routeId: schedule.routeId,
        fleetId: schedule.fleetId,
        departureAt,
        arrivalAt: addMinutes(departureAt, schedule.route.durationMinutes),
        price: schedule.fleet.price,
        seatTier: schedule.fleet.seatTier,
        capacity: getSeatCapacity(schedule.fleet.type),
        facilities: facilities as unknown as Prisma.InputJsonValue,
      });
    }
  }

  if (plans.length === 0) return 0;

  return prisma.$transaction(async (tx) => {
    const created = await tx.trip.createMany({ data: plans, skipDuplicates: true });
    if (created.count === 0) return 0;

    const keys = plans.map((p) => ({
      scheduleId: p.scheduleId as string,
      departureAt: p.departureAt as Date,
    }));
    const trips = await tx.trip.findMany({
      where: { OR: keys },
      select: { id: true },
    });

    for (const trip of trips) {
      for (const service of services) {
        const catalog = await tx.tripOptionalService.findUnique({
          where: { tripId_serviceId: { tripId: trip.id, serviceId: service.id } },
        });
        if (catalog) continue;

        await tx.tripOptionalService.create({
          data: {
            tripId: trip.id,
            serviceId: service.id,
            name: service.name,
            price: service.price,
            capacity: service.capacity,
          },
        });
      }
    }

    return created.count;
  });
}

export async function completeTrips() {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const trips = await tx.trip.updateMany({
      where: { status: 'SCHEDULED', arrivalAt: { lte: now } },
      data: { status: 'COMPLETED' },
    });
    const completed = await tx.trip.findMany({
      where: { status: 'COMPLETED' },
      select: { id: true },
    });
    const bookings = await tx.booking.updateMany({
      where: {
        status: 'PAID',
        tripId: { in: completed.map((t) => t.id) },
      },
      data: { status: 'COMPLETED' },
    });
    return { trips: trips.count, bookings: bookings.count };
  });
}
