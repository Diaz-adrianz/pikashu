import { addMinutes, addHours } from 'date-fns';
import { Prisma } from '@/generated/prisma/client';
import { ActionError } from '@/lib/action';
import { generateBookingCode, generateQrToken, generateTicketCode } from '@/lib/code';
import { appUrl, sendMail } from '@/lib/mail';
import { createSnapTransaction, getTransactionStatus, refundTransaction } from '@/lib/midtrans';
import { prisma } from '@/lib/prisma';
import { getSeatLayout } from '@/features/trip/seat-layout';
import { CreateBooking } from './schemas';

const HOLD_MINUTES = 15;
const ACTIVE_BOOKING_STATUSES = ['PENDING_PAYMENT', 'PAID', 'COMPLETED'] as const;

const bookingSelect = {
  id: true,
  code: true,
  status: true,
  totalAmount: true,
  expiresAt: true,
  paidAt: true,
  cancelledAt: true,
  createdAt: true,
  trip: {
    select: {
      id: true,
      departureAt: true,
      arrivalAt: true,
      price: true,
      seatTier: true,
      route: { select: { name: true, originCity: true, destinationCity: true } },
      fleet: { select: { name: true } },
    },
  },
  tickets: {
    select: {
      id: true,
      code: true,
      seatNumber: true,
      passengerName: true,
      status: true,
      boardingStatus: true,
      boardedAt: true,
    },
  },
  optionalServices: {
    select: {
      id: true,
      name: true,
      price: true,
      quantity: true,
    },
  },
  payment: {
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      token: true,
      redirectUrl: true,
      paidAt: true,
      refunds: {
        select: {
          id: true,
          amount: true,
          status: true,
          reason: true,
          createdAt: true,
        },
      },
    },
  },
} satisfies Prisma.BookingSelect;

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2002' || error.code === 'P2034')
  );
}

export async function readBookings(
  userId: string,
  opts: { status?: string; page: number; limit: number }
) {
  const where: Prisma.BookingWhereInput = { userId };
  if (opts.status && ['PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED', 'COMPLETED'].includes(opts.status))
    where.status = opts.status as 'PENDING_PAYMENT';

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      select: bookingSelect,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);
  return { items, total };
}

export async function readBooking(userId: string, code: string) {
  return prisma.booking.findFirst({
    where: { code, userId },
    select: bookingSelect,
  });
}

export async function readTicketForUser(userId: string, code: string) {
  return prisma.ticket.findFirst({
    where: { code, booking: { userId } },
    select: {
      id: true,
      code: true,
      qrToken: true,
      seatNumber: true,
      passengerName: true,
      status: true,
      boardingStatus: true,
      boardedAt: true,
      trip: {
        select: {
          departureAt: true,
          arrivalAt: true,
          seatTier: true,
          route: {
            select: { name: true, originCity: true, destinationCity: true },
          },
          fleet: { select: { name: true } },
        },
      },
    },
  });
}

export async function createBooking(userId: string, data: CreateBooking) {
  const trip = await prisma.trip.findUnique({
    where: { id: data.tripId },
    include: { fleet: true, optionalServices: { include: { service: true } } },
  });
  if (!trip) throw new ActionError('Perjalanan tidak ditemukan');
  if (trip.status !== 'SCHEDULED')
    throw new ActionError('Perjalanan tidak tersedia');
  if (trip.departureAt <= addHours(new Date(), 2))
    throw new ActionError('Pemesanan ditutup 2 jam sebelum keberangkatan');

  const validSeats = new Set(
    getSeatLayout(trip.fleet.type).seats.map((s) => s.number)
  );
  const seats = data.passengers.map((p) => p.seatNumber);
  if (new Set(seats).size !== seats.length)
    throw new ActionError('Kursi tidak boleh duplikat');
  if (seats.some((s) => !validSeats.has(s)))
    throw new ActionError('Nomor kursi tidak valid');

  const occupied = await prisma.ticket.findMany({
    where: { tripId: trip.id, status: 'VALID', seatNumber: { in: seats } },
    select: { seatNumber: true },
  });
  if (occupied.length) throw new ActionError('Kursi sudah dipesan');

  const catalog = new Map(
    trip.optionalServices.map((s) => [s.serviceId, s])
  );
  const totals = new Map<string, number>();
  for (const item of data.services) {
    const snapshot = catalog.get(item.serviceId);
    if (!snapshot || snapshot.service.status !== 'ACTIVE')
      throw new ActionError('Layanan tidak tersedia');
    totals.set(item.serviceId, (totals.get(item.serviceId) ?? 0) + item.quantity);
  }

  for (const [serviceId, quantity] of totals) {
    const snapshot = catalog.get(serviceId)!;
    if (snapshot.capacity !== null) {
      const used = await prisma.bookingOptionalService.aggregate({
        where: {
          tripOptionalServiceId: snapshot.id,
          booking: { status: { in: [...ACTIVE_BOOKING_STATUSES] } },
        },
        _sum: { quantity: true },
      });
      if ((used._sum.quantity ?? 0) + quantity > snapshot.capacity)
        throw new ActionError(`Kuota ${snapshot.name} tidak mencukupi`);
    }
  }

  const serviceTotal = data.services.reduce((sum, item) => {
    const snapshot = catalog.get(item.serviceId)!;
    return sum + snapshot.price * item.quantity;
  }, 0);
  const total = trip.price * seats.length + serviceTotal;
  const expiresAt = addMinutes(new Date(), HOLD_MINUTES);

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateBookingCode();
    try {
      return await prisma.$transaction(
        async (tx) => {
          const taken = await tx.ticket.findMany({
            where: { tripId: trip.id, status: 'VALID', seatNumber: { in: seats } },
            select: { seatNumber: true },
          });
          if (taken.length) throw new ActionError('Kursi sudah dipesan');

          return tx.booking.create({
            data: {
              code,
              userId,
              tripId: trip.id,
              totalAmount: total,
              expiresAt,
              tickets: {
                create: data.passengers.map((p) => ({
                  tripId: trip.id,
                  seatNumber: p.seatNumber,
                  passengerName: p.passengerName,
                  code: generateTicketCode(),
                  qrToken: generateQrToken(),
                })),
              },
              optionalServices: {
                create: Array.from(totals, ([serviceId, quantity]) => {
                  const snapshot = catalog.get(serviceId)!;
                  return {
                    serviceId,
                    tripOptionalServiceId: snapshot.id,
                    name: snapshot.name,
                    price: snapshot.price,
                    quantity,
                  };
                }),
              },
              payment: {
                create: {
                  orderId: code,
                  amount: total,
                  status: 'CREATING',
                },
              },
            },
            select: bookingSelect,
          });
        },
        { isolationLevel: 'Serializable' }
      );
    } catch (error) {
      if (isUniqueError(error)) continue;
      throw error;
    }
  }
  throw new ActionError('Gagal membuat pemesanan. Silakan coba lagi.');
}

export async function createPaymentAttempt(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      user: true,
      trip: { include: { route: true, fleet: true } },
      tickets: true,
      optionalServices: true,
      payment: true,
    },
  });
  if (!booking) throw new ActionError('Pemesanan tidak ditemukan');
  if (booking.status !== 'PENDING_PAYMENT')
    throw new ActionError('Pemesanan tidak menunggu pembayaran');
  if (booking.expiresAt <= new Date())
    throw new ActionError('Waktu pembayaran telah habis');
  if (!booking.payment) throw new ActionError('Data pembayaran tidak ditemukan');
  if (booking.payment.token && booking.payment.redirectUrl)
    return { token: booking.payment.token, redirectUrl: booking.payment.redirectUrl };

  await prisma.payment.update({
    where: { id: booking.payment.id },
    data: { status: 'CREATING' },
  });

  try {
    const items = [
      {
        id: booking.trip.id,
        name: `Tiket ${booking.trip.route.name}`,
        price: booking.trip.price,
        quantity: booking.tickets.length,
      },
      ...booking.optionalServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        quantity: s.quantity,
      })),
    ];
    const snap = await createSnapTransaction({
      orderId: booking.code,
      amount: booking.totalAmount,
      expiresAt: booking.expiresAt,
      customer: {
        name: booking.user.name ?? 'Penumpang',
        email: booking.user.email ?? '',
        phone: booking.user.phone,
      },
      items,
    });

    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: 'PENDING', token: snap.token, redirectUrl: snap.redirect_url },
    });
    return { token: snap.token, redirectUrl: snap.redirect_url };
  } catch (error) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: 'PENDING' },
    });
    throw error;
  }
}

export async function expireBookings() {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const bookings = await tx.booking.findMany({
      where: { status: 'PENDING_PAYMENT', expiresAt: { lte: now } },
      select: { id: true },
    });
    if (!bookings.length) return 0;

    const ids = bookings.map((b) => b.id);
    await tx.booking.updateMany({
      where: { id: { in: ids }, status: 'PENDING_PAYMENT' },
      data: { status: 'EXPIRED' },
    });
    await tx.ticket.updateMany({
      where: { bookingId: { in: ids }, status: 'VALID' },
      data: { status: 'CANCELLED' },
    });
    await tx.payment.updateMany({
      where: { bookingId: { in: ids }, status: 'PENDING' },
      data: { status: 'EXPIRED' },
    });
    return ids.length;
  });
}

async function sendConfirmation(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      code: true,
      totalAmount: true,
      user: { select: { email: true, name: true } },
      trip: {
        select: {
          departureAt: true,
          route: { select: { name: true } },
        },
      },
      tickets: { select: { code: true, passengerName: true, seatNumber: true } },
    },
  });
  if (!booking?.user.email) return;

  const links = booking.tickets
    .map(
      (t) =>
        `<li>${t.passengerName} · ${t.seatNumber} · <a href="${appUrl()}/tickets/${t.code}">${t.code}</a></li>`
    )
    .join('');
  await sendMail({
    to: booking.user.email,
    subject: `Tiket Pikashu ${booking.code}`,
    html: `<h1>Pembayaran berhasil</h1><p>${booking.trip.route.name} · ${booking.trip.departureAt.toISOString()}</p><ul>${links}</ul>`,
  });
}

type Notification = {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  gross_amount: string;
  signature_key?: string;
  status_code: string;
  transaction_id?: string;
  payment_type?: string;
  refund_id?: string;
};

export async function processNotification(input: Notification) {
  const payment = await prisma.payment.findUnique({
    where: { orderId: input.order_id },
    include: {
      booking: { include: { tickets: true, optionalServices: true } },
    },
  });
  if (!payment) throw new ActionError('Pembayaran tidak ditemukan');

  const success =
    ['settlement', 'capture'].includes(input.transaction_status) &&
    input.fraud_status !== 'challenge';
  const failure = ['expire', 'cancel', 'deny'].includes(input.transaction_status);
  const refundEvent = ['refund', 'partial_refund'].includes(input.transaction_status);

  if (refundEvent) {
    await prisma.refund.updateMany({
      where: {
        paymentId: payment.id,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      data: { status: 'SUCCEEDED', providerRefundId: input.refund_id },
    });
    return;
  }

  if (success) {
    if (payment.status === 'PAID') return;

    const booking = payment.booking;
    if (['CANCELLED', 'COMPLETED'].includes(booking.status)) {
      await prisma.refund.upsert({
        where: { idempotencyKey: `${booking.code}-late-payment` },
        create: {
          paymentId: payment.id,
          amount: booking.totalAmount,
          reason: 'Pembayaran setelah pemesanan dibatalkan',
          idempotencyKey: `${booking.code}-late-payment`,
          status: 'PENDING',
        },
        update: {},
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const seatNumbers = booking.tickets.map((t) => t.seatNumber);
      let conflictReason = '';

      const seatConflicts = await tx.ticket.count({
        where: {
          tripId: booking.tripId,
          status: 'VALID',
          seatNumber: { in: seatNumbers },
          bookingId: { not: booking.id },
        },
      });
      if (seatConflicts > 0) conflictReason = 'Kursi tidak tersedia saat pembayaran diterima';

      if (!conflictReason) {
        for (const service of booking.optionalServices) {
          const snapshot = await tx.tripOptionalService.findUnique({
            where: { id: service.tripOptionalServiceId },
            select: { capacity: true },
          });
          if (!snapshot || snapshot.capacity === null) continue;
          const used = await tx.bookingOptionalService.aggregate({
            where: {
              tripOptionalServiceId: service.tripOptionalServiceId,
              bookingId: { not: booking.id },
              booking: { status: { in: [...ACTIVE_BOOKING_STATUSES] } },
            },
            _sum: { quantity: true },
          });
          if ((used._sum.quantity ?? 0) + service.quantity > snapshot.capacity) {
            conflictReason = `Kuota ${service.name} tidak tersedia saat pembayaran diterima`;
            break;
          }
        }
      }

      if (conflictReason) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED', cancelledAt: new Date() },
        });
        await tx.ticket.updateMany({
          where: { bookingId: booking.id, status: 'VALID' },
          data: { status: 'CANCELLED' },
        });
        await tx.refund.upsert({
          where: { idempotencyKey: `${booking.code}-late-payment` },
          create: {
            paymentId: payment.id,
            amount: booking.totalAmount,
            reason: conflictReason,
            idempotencyKey: `${booking.code}-late-payment`,
            status: 'PENDING',
          },
          update: {},
        });
        return;
      }

      await tx.ticket.updateMany({
        where: { bookingId: booking.id, status: 'CANCELLED' },
        data: { status: 'VALID' },
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'PAID', paidAt: new Date() },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          transactionId: input.transaction_id,
          method: input.payment_type,
        },
      });
    });

    await sendConfirmation(booking.id);
    return;
  }

  if (failure) {
    if (payment.status === 'PAID') return;
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' },
      });
      await tx.booking.updateMany({
        where: { id: payment.bookingId, status: 'PENDING_PAYMENT' },
        data: { status: 'EXPIRED' },
      });
      await tx.ticket.updateMany({
        where: { bookingId: payment.bookingId, status: 'VALID' },
        data: { status: 'CANCELLED' },
      });
    });
  }
}

export async function cancelBooking(userId: string, code: string) {
  const booking = await prisma.booking.findFirst({
    where: { code, userId },
    include: { payment: true, trip: true, user: { select: { email: true } } },
  });
  if (!booking) throw new ActionError('Pemesanan tidak ditemukan');
  if (!['PENDING_PAYMENT', 'PAID', 'COMPLETED'].includes(booking.status))
    throw new ActionError('Pemesanan tidak dapat dibatalkan');
  if (booking.trip.departureAt <= new Date())
    throw new ActionError('Pemesanan sudah tidak dapat dibatalkan');

  const paid = booking.payment?.status === 'PAID';
  const idempotencyKey = `${booking.code}-cancel`;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    await tx.ticket.updateMany({
      where: { bookingId: booking.id, status: 'VALID' },
      data: { status: 'CANCELLED' },
    });
    if (paid) {
      await tx.refund.upsert({
        where: { idempotencyKey },
        create: {
          paymentId: booking.payment!.id,
          amount: booking.totalAmount,
          reason: 'Pembatalan oleh penumpang',
          idempotencyKey,
          status: 'PENDING',
        },
        update: {},
      });
    }
  });

  if (paid && booking.payment) {
    try {
      await refundTransaction({
        orderId: booking.payment.orderId,
        amount: booking.totalAmount,
        reason: 'Pembatalan oleh penumpang',
        idempotencyKey,
      });
      await prisma.refund.update({
        where: { idempotencyKey },
        data: { status: 'PROCESSING' },
      });
    } catch {
      // Manual fallback: refund remains PENDING for admin processing.
    }
  }

  if (booking.user.email)
    await sendMail({
      to: booking.user.email,
      subject: `Pemesanan ${booking.code} dibatalkan`,
      html: `<p>Pemesanan ${booking.code} telah dibatalkan.${paid ? ' Refund sedang diproses.' : ''}</p>`,
    }).catch(() => undefined);
  return booking;
}

export async function requestRefund(orderId: string, reason: string) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: { booking: true },
  });
  if (!payment || payment.status !== 'PAID')
    throw new ActionError('Pembayaran tidak memenuhi syarat refund');
  if (payment.booking.status !== 'CANCELLED')
    throw new ActionError('Pemesanan belum dibatalkan');

  const existing = await prisma.refund.findFirst({
    where: { paymentId: payment.id },
    orderBy: { createdAt: 'desc' },
  });
  if (existing && ['PENDING', 'PROCESSING', 'SUCCEEDED'].includes(existing.status))
    throw new ActionError('Refund sudah diproses');

  const idempotencyKey = `${payment.orderId}-refund-${Date.now()}`;
  const refund = await prisma.refund.create({
    data: {
      paymentId: payment.id,
      amount: payment.amount,
      reason,
      idempotencyKey,
      status: 'PENDING',
    },
  });

  try {
    await refundTransaction({
      orderId: payment.orderId,
      amount: payment.amount,
      reason,
      idempotencyKey,
    });
    return prisma.refund.update({
      where: { id: refund.id },
      data: { status: 'PROCESSING' },
    });
  } catch {
    return refund;
  }
}

export async function syncBookingPayment(userId: string, code: string) {
  const booking = await prisma.booking.findFirst({
    where: { code, userId },
    select: { id: true, payment: { select: { orderId: true } } },
  });
  if (!booking?.payment) throw new ActionError('Pemesanan tidak ditemukan');

  const status = await getTransactionStatus(booking.payment.orderId);
  await processNotification({
    order_id: booking.payment.orderId,
    transaction_status: status.transaction_status,
    fraud_status: status.fraud_status,
    gross_amount: status.gross_amount,
    status_code: status.status_code,
    transaction_id: status.transaction_id,
    payment_type: status.payment_type,
  });
  return status;
}

export async function readRefunds(opts: { page: number; limit: number }) {
  const [items, total] = await Promise.all([
    prisma.refund.findMany({
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      include: {
        payment: {
          select: {
            orderId: true,
            amount: true,
            booking: { select: { code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.refund.count(),
  ]);
  return { items, total };
}
