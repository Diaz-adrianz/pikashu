import assert from 'node:assert/strict';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';
import { prisma } from '../src/lib/prisma';
import {
  createBooking,
  expireBookings,
  processNotification,
} from '../src/features/booking/services';
import { boardTicket } from '../src/features/ticket/services';

const suffix = Date.now().toString(36).toUpperCase();
const email = (role: string) => `${role}-${suffix}@example.test`;
const input = (seatNumber: string) => ({
  tripId: '',
  passengers: [
    { seatNumber, passengerName: 'Penumpang Uji' },
  ],
  services: [],
});

async function main() {
  const departureAt = setMinutes(
    setHours(startOfDay(addDays(new Date(), 1)), 10),
    0
  );
  const [passengerA, passengerB, staff] = await Promise.all([
    prisma.user.create({ data: { name: 'Penumpang A', email: email('a') } }),
    prisma.user.create({ data: { name: 'Penumpang B', email: email('b') } }),
    prisma.user.create({
      data: { name: 'Staf Uji', email: email('staff'), role: 'STAFF' },
    }),
  ]);
  const fleet = await prisma.fleet.create({
    data: {
      name: `Armada Uji ${suffix}`,
      type: 'MINIBUS',
      seatTier: 'ECONOMY',
      price: 100000,
    },
  });
  const route = await prisma.route.create({
    data: {
      name: `Rute Uji ${suffix}`,
      originCity: 'Bandung',
      destinationCity: 'Jakarta',
      originLat: -6.9,
      originLng: 107.6,
      destinationLat: -6.2,
      destinationLng: 106.8,
      durationMinutes: 180,
    },
  });
  const schedule = await prisma.schedule.create({
    data: { routeId: route.id, fleetId: fleet.id, departureTime: '10:00' },
  });
  const trip = await prisma.trip.create({
    data: {
      scheduleId: schedule.id,
      routeId: route.id,
      fleetId: fleet.id,
      departureAt,
      arrivalAt: addDays(departureAt, 0),
      price: 100000,
      seatTier: 'ECONOMY',
      capacity: 16,
      facilities: [],
    },
  });
  await prisma.tripStaff.create({
    data: { tripId: trip.id, staffId: staff.id },
  });

  const bookingIds: string[] = [];
  try {
    const seat = input('1');
    seat.tripId = trip.id;
    const [first, second] = await Promise.allSettled([
      createBooking(passengerA.id, seat),
      createBooking(passengerB.id, seat),
    ]);
    assert.equal(
      [first.status, second.status].filter((s) => s === 'fulfilled').length,
      1,
      'concurrent booking must reserve the seat once'
    );
    const booking =
      first.status === 'fulfilled' ? first.value : (second as PromiseFulfilledResult<Awaited<ReturnType<typeof createBooking>>>).value;
    bookingIds.push(booking.id);

    const notification = {
      order_id: booking.code,
      transaction_status: 'settlement',
      status_code: '200',
      gross_amount: String(booking.totalAmount),
    };
    await processNotification(notification);
    await processNotification(notification);
    const paid = await prisma.booking.findUniqueOrThrow({
      where: { id: booking.id },
      include: { tickets: true, payment: true },
    });
    assert.equal(paid.status, 'PAID');
    assert.equal(paid.payment?.status, 'PAID');
    assert.equal(paid.tickets.length, 1);

    const token = paid.tickets[0].qrToken;
    const boarded = await boardTicket(staff.id, token);
    const duplicate = await boardTicket(staff.id, token);
    assert.equal(boarded.alreadyBoarded, false);
    assert.equal(duplicate.alreadyBoarded, true);

    const expiring = input('2');
    expiring.tripId = trip.id;
    const pending = await createBooking(passengerB.id, expiring);
    bookingIds.push(pending.id);
    await prisma.booking.update({
      where: { id: pending.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await expireBookings();
    const expired = await prisma.booking.findUniqueOrThrow({
      where: { id: pending.id },
      include: { tickets: true },
    });
    assert.equal(expired.status, 'EXPIRED');
    assert.equal(expired.tickets[0].status, 'CANCELLED');

    const reassigned = input('2');
    reassigned.tripId = trip.id;
    const released = await createBooking(passengerB.id, reassigned);
    bookingIds.push(released.id);

    console.log('integration-check OK');
  } finally {
    const payments = await prisma.payment.findMany({
      where: { bookingId: { in: bookingIds } },
      select: { id: true },
    });
    await prisma.refund.deleteMany({
      where: { paymentId: { in: payments.map((p) => p.id) } },
    });
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.tripStaff.deleteMany({ where: { tripId: trip.id } });
    await prisma.trip.delete({ where: { id: trip.id } });
    await prisma.schedule.delete({ where: { id: schedule.id } });
    await prisma.route.delete({ where: { id: route.id } });
    await prisma.fleet.delete({ where: { id: fleet.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [passengerA.id, passengerB.id, staff.id] } },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
