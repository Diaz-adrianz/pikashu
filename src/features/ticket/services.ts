import QRCode from 'qrcode';
import { ActionError } from '@/lib/action';
import { prisma } from '@/lib/prisma';

export async function readQrDataUrl(userId: string, code: string) {
  const ticket = await prisma.ticket.findFirst({
    where: { code, booking: { userId } },
    select: { qrToken: true },
  });
  if (!ticket) throw new ActionError('Tiket tidak ditemukan');
  return QRCode.toDataURL(ticket.qrToken, {
    width: 256,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

export async function readAssignedTrips(staffId: string) {
  const trips = await prisma.trip.findMany({
    where: {
      staff: { some: { staffId } },
      status: { in: ['SCHEDULED', 'COMPLETED'] },
      departureAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: {
      route: true,
      fleet: true,
      _count: { select: { staff: true } },
    },
    orderBy: { departureAt: 'asc' },
  });

  return Promise.all(
    trips.map(async (trip) => {
      const [passengers, boarded] = await Promise.all([
        prisma.ticket.count({
          where: { tripId: trip.id, status: 'VALID' },
        }),
        prisma.ticket.count({
          where: { tripId: trip.id, status: 'VALID', boardingStatus: 'BOARDED' },
        }),
      ]);
      return {
        id: trip.id,
        departureAt: trip.departureAt,
        arrivalAt: trip.arrivalAt,
        status: trip.status,
        route: trip.route,
        fleet: trip.fleet,
        passengers,
        boarded,
        notBoarded: passengers - boarded,
      };
    })
  );
}

export async function readStaffManifest(staffId: string, tripId: string) {
  const assignment = await prisma.tripStaff.findUnique({
    where: { tripId_staffId: { tripId, staffId } },
    include: {
      staff: { select: { status: true, role: true } },
    },
  });
  if (
    !assignment ||
    assignment.staff.status !== 'ACTIVE' ||
    assignment.staff.role !== 'STAFF'
  )
    throw new ActionError('Akses ditolak');

  return prisma.ticket.findMany({
    where: { tripId, status: 'VALID' },
    select: {
      code: true,
      seatNumber: true,
      passengerName: true,
      status: true,
      boardingStatus: true,
      boardedAt: true,
      booking: { select: { code: true } },
    },
    orderBy: { seatNumber: 'asc' },
  });
}

export async function boardTicket(staffId: string, token: string) {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
    select: { role: true, status: true },
  });
  if (!staff || staff.role !== 'STAFF' || staff.status !== 'ACTIVE')
    throw new ActionError('Akses ditolak');

  return prisma.$transaction(
    async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { qrToken: token },
        select: {
          id: true,
          code: true,
          passengerName: true,
          seatNumber: true,
          tripId: true,
          status: true,
          boardingStatus: true,
          boardedAt: true,
          booking: { select: { status: true } },
        },
      });
      if (!ticket) throw new ActionError('Tiket tidak ditemukan');

      const assigned = await tx.tripStaff.findUnique({
        where: {
          tripId_staffId: { tripId: ticket.tripId, staffId },
        },
      });
      if (!assigned) throw new ActionError('Staf tidak ditugaskan di perjalanan ini');

      if (ticket.status !== 'VALID')
        throw new ActionError('Tiket sudah dibatalkan');
      if (ticket.boardingStatus === 'BOARDED') {
        return {
          ...ticket,
          alreadyBoarded: true as const,
        };
      }
      if (!['PAID', 'COMPLETED'].includes(ticket.booking.status))
        throw new ActionError('Pembayaran belum selesai');

      const updated = await tx.ticket.updateMany({
        where: {
          id: ticket.id,
          status: 'VALID',
          boardingStatus: 'NOT_BOARDED',
        },
        data: { boardingStatus: 'BOARDED', boardedAt: new Date() },
      });
      if (updated.count !== 1)
        throw new ActionError('Tiket sudah dipindai oleh staf lain');

      return {
        ...ticket,
        boardingStatus: 'BOARDED' as const,
        alreadyBoarded: false as const,
      };
    },
    { isolationLevel: 'Serializable' }
  );
}
