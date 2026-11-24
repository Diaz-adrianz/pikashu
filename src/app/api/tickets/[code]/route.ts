import { readTicketForUser } from '@/features/booking/services';
import { apiHandler, ApiError, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

type Ticket = NonNullable<Awaited<ReturnType<typeof readTicketForUser>>>;
export type GetTicketResponse = ApiResponse<Omit<Ticket, 'qrToken'>>;

export const GET = apiHandler(
  async (_, ctx): Promise<GetTicketResponse> => {
    const session = await authorized(['PASSENGER'], 'throw');
    const ticket = await readTicketForUser(session.user.id, ctx.params.code);
    if (!ticket) throw new ApiError('NOT_FOUND', 'Tiket tidak ditemukan', 404);

    // Explicit fields: qrToken must never leak into ticket detail responses.
    return {
      message: 'Success',
      data: {
        id: ticket.id,
        code: ticket.code,
        seatNumber: ticket.seatNumber,
        passengerName: ticket.passengerName,
        status: ticket.status,
        boardingStatus: ticket.boardingStatus,
        boardedAt: ticket.boardedAt,
        trip: ticket.trip,
      },
    };
  }
);
