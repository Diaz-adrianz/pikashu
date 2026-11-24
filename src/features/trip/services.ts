import { addHours, endOfDay, startOfDay } from 'date-fns';
import { Prisma } from '@/generated/prisma/client';
import { ActionError } from '@/lib/action';
import { sendMail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';

const tripInclude = {
  schedule: true,
  route: true,
  fleet: { include: { images: { where: { isMain: true }, take: 1 } } },
  optionalServices: true,
  staff: { include: { staff: { select: { id: true, name: true, email: true } } } },
  _count: { select: { bookings: true } },
} satisfies Prisma.TripInclude;

export async function readTrips(opts: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.TripWhereInput = {},
    skip = (opts.page - 1) * opts.limit;

  if (opts.search)
    where.OR = [
      { route: { name: { contains: opts.search, mode: 'insensitive' } } },
      { route: { originCity: { contains: opts.search, mode: 'insensitive' } } },
      { route: { destinationCity: { contains: opts.search, mode: 'insensitive' } } },
      { fleet: { name: { contains: opts.search, mode: 'insensitive' } } },
    ];
  if (opts.status && ['SCHEDULED', 'CANCELLED', 'COMPLETED'].includes(opts.status))
    where.status = opts.status as 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

  const [items, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take: opts.limit,
      include: {
        ...tripInclude,
        _count: { select: { bookings: true, tickets: true } },
      },
      orderBy: { departureAt: 'desc' },
    }),
    prisma.trip.count({ where }),
  ]);

  const enriched = await Promise.all(
    items.map(async (trip) => {
      const [sold, passengers] = await Promise.all([
        prisma.ticket.count({
          where: { tripId: trip.id, status: 'VALID' },
        }),
        prisma.ticket.count({
          where: {
            tripId: trip.id,
            status: 'VALID',
            booking: { status: { in: ['PAID', 'COMPLETED'] } },
          },
        }),
      ]);
      return { ...trip, sold, passengers, available: trip.capacity - sold };
    })
  );

  return { items: enriched, total };
}

export async function readTrip(id: string) {
  return prisma.trip.findUnique({ where: { id }, include: tripInclude });
}

export async function readPublicTrip(id: string) {
  const trip = await prisma.trip.findFirst({
    where: { id, status: 'SCHEDULED' },
    include: tripInclude,
  });
  if (!trip) return null;

  const occupied = await prisma.ticket.findMany({
    where: { tripId: id, status: 'VALID' },
    select: { seatNumber: true },
  });
  return { ...trip, occupiedSeats: occupied.map((t) => t.seatNumber) };
}

export async function cancelTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      route: { select: { name: true } },
      bookings: {
        where: { status: { in: ['PENDING_PAYMENT', 'PAID'] } },
        include: { payment: true, user: { select: { email: true } } },
      },
    },
  });
  if (!trip) throw new ActionError('Perjalanan tidak ditemukan');
  if (trip.status !== 'SCHEDULED')
    throw new ActionError('Perjalanan tidak dapat dibatalkan');

  const cancelled = await prisma.$transaction(async (tx) => {
    await tx.trip.update({ where: { id }, data: { status: 'CANCELLED' } });
    await tx.booking.updateMany({
      where: { tripId: id, status: { in: ['PENDING_PAYMENT', 'PAID'] } },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    await tx.ticket.updateMany({
      where: { tripId: id, booking: { status: 'CANCELLED' }, status: 'VALID' },
      data: { status: 'CANCELLED' },
    });

    for (const booking of trip.bookings) {
      if (booking.payment?.status !== 'PAID') continue;
      await tx.refund.create({
        data: {
          paymentId: booking.payment.id,
          amount: booking.totalAmount,
          reason: 'Perjalanan dibatalkan admin',
          status: 'PENDING',
          idempotencyKey: `${booking.code}-trip-cancel`,
        },
      });
    }
    return trip;
  });

  await Promise.all(
    trip.bookings.map((booking) =>
      booking.user.email
        ? sendMail({
            to: booking.user.email,
            subject: `Perjalanan ${trip.route.name} dibatalkan`,
            html: `<p>Perjalanan ${trip.route.name} pada ${trip.departureAt.toISOString()} telah dibatalkan.${booking.payment?.status === 'PAID' ? ' Refund sedang diproses.' : ''}</p>`,
          }).catch(() => undefined)
        : undefined
    )
  );
  return cancelled;
}

export async function assignStaff(tripId: string, staffIds: string[]) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new ActionError('Perjalanan tidak ditemukan');

  const unique = Array.from(new Set(staffIds));
  const valid = await prisma.user.count({
    where: {
      id: { in: unique },
      role: 'STAFF',
      status: 'ACTIVE',
    },
  });
  if (valid !== unique.length)
    throw new ActionError('Staf tidak valid atau tidak aktif');

  return prisma.$transaction(async (tx) => {
    await tx.tripStaff.deleteMany({ where: { tripId } });
    if (unique.length)
      await tx.tripStaff.createMany({
        data: unique.map((staffId) => ({ tripId, staffId })),
      });
    return tx.tripStaff.findMany({
      where: { tripId },
      include: { staff: { select: { id: true, name: true, email: true } } },
    });
  });
}

export type TripSearch = {
  originCity?: string;
  destinationCity?: string;
  departureDate?: string;
  seats?: number;
  seatTier?: string;
  sort?: string;
  page: number;
  limit: number;
};

export async function searchTrips(opts: TripSearch) {
  const routeWhere: Prisma.RouteWhereInput = {};
  const departureAt: Prisma.DateTimeFilter<'Trip'> = {
    gt: addHours(new Date(), 2),
  };
  const where: Prisma.TripWhereInput = { status: 'SCHEDULED', departureAt };

  if (opts.originCity)
    routeWhere.originCity = { equals: opts.originCity, mode: 'insensitive' };
  if (opts.destinationCity)
    routeWhere.destinationCity = {
      equals: opts.destinationCity,
      mode: 'insensitive',
    };
  if (Object.keys(routeWhere).length) where.route = routeWhere;
  if (opts.seatTier && ['ECONOMY', 'BUSINESS'].includes(opts.seatTier))
    where.seatTier = opts.seatTier as 'ECONOMY' | 'BUSINESS';
  if (opts.departureDate) {
    const day = new Date(opts.departureDate);
    if (!Number.isNaN(day.getTime())) {
      departureAt.gte = startOfDay(day);
      departureAt.lte = endOfDay(day);
    }
  }

  const trips = await prisma.trip.findMany({
    where,
    include: {
      route: true,
      fleet: { include: { images: { where: { isMain: true }, take: 1 } } },
    },
  });

  const seats = Math.max(1, opts.seats ?? 1);
  const counts = await prisma.ticket.groupBy({
    by: ['tripId'],
    where: {
      status: 'VALID',
      tripId: { in: trips.map((t) => t.id) },
    },
    _count: { _all: true },
  });
  const occupied = new Map(counts.map((c) => [c.tripId, c._count._all]));

  const available = trips
    .map((trip) => ({
      ...trip,
      available: trip.capacity - (occupied.get(trip.id) ?? 0),
    }))
    .filter((trip) => trip.available >= seats);

  const sorters: Record<string, (a: (typeof available)[number], b: (typeof available)[number]) => number> = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    departure_desc: (a, b) => b.departureAt.getTime() - a.departureAt.getTime(),
    departure_asc: (a, b) => a.departureAt.getTime() - b.departureAt.getTime(),
  };
  available.sort(sorters[opts.sort ?? 'departure_asc'] ?? sorters.departure_asc);

  const start = (opts.page - 1) * opts.limit;
  return { items: available.slice(start, start + opts.limit), total: available.length };
}
