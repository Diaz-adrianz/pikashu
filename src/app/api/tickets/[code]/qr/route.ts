import { readTicketForUser } from '@/features/booking/services';
import { readQrDataUrl } from '@/features/ticket/services';
import { apiHandler, ApiError, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetTicketQrResponse = ApiResponse<{ qr: string }>;

export const GET = apiHandler(
  async (_, ctx): Promise<GetTicketQrResponse> => {
    const session = await authorized(['PASSENGER'], 'throw');
    const ticket = await readTicketForUser(session.user.id, ctx.params.code);
    if (!ticket) throw new ApiError('NOT_FOUND', 'Tiket tidak ditemukan', 404);

    const qr = await readQrDataUrl(session.user.id, ctx.params.code);
    return { message: 'Success', data: { qr } };
  }
);
