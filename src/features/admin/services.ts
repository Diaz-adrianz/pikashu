import { BookingStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';

export async function getAdminSummary() {
  const now = new Date();

  const [revenue, bookingGroups, trips, payments, refunds] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.trip.findMany({
      where: { status: 'SCHEDULED', departureAt: { gte: now } },
      take: 5,
      orderBy: { departureAt: 'asc' },
      select: {
        id: true,
        departureAt: true,
        arrivalAt: true,
        price: true,
        seatTier: true,
        capacity: true,
        route: {
          select: { name: true, originCity: true, destinationCity: true },
        },
        fleet: { select: { name: true } },
      },
    }),
    prisma.payment.findMany({
      where: { status: 'PAID' },
      take: 5,
      orderBy: { paidAt: 'desc' },
      select: {
        orderId: true,
        amount: true,
        paidAt: true,
        booking: { select: { code: true } },
      },
    }),
    prisma.refund.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        reason: true,
        createdAt: true,
        payment: {
          select: { orderId: true, booking: { select: { code: true } } },
        },
      },
    }),
  ]);

  const tripIds = trips.map((trip) => trip.id);
  const soldGroups = tripIds.length
    ? await prisma.ticket.groupBy({
        by: ['tripId'],
        where: { tripId: { in: tripIds }, status: 'VALID' },
        _count: { _all: true },
      })
    : [];
  const soldByTrip = new Map(
    soldGroups.map((group) => [group.tripId, group._count._all])
  );

  const bookings = Object.fromEntries(
    Object.values(BookingStatus).map((status) => [status, 0])
  ) as Record<BookingStatus, number>;
  for (const group of bookingGroups) bookings[group.status] = group._count._all;

  const upcomingTrips = trips.map((trip) => {
    const sold = soldByTrip.get(trip.id) ?? 0;
    return {
      ...trip,
      sold,
      available: Math.max(0, trip.capacity - sold),
      occupancy:
        trip.capacity > 0 ? Math.round((sold / trip.capacity) * 100) : 0,
    };
  });

  return {
    totalRevenue: revenue._sum.amount ?? 0,
    bookings,
    upcomingTrips,
    transactions: payments,
    refunds,
  };
}
