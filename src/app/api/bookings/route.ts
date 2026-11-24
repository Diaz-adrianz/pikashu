import { readBookings } from '@/features/booking/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetBookingsResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readBookings>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetBookingsResponse> => {
  const session = await authorized(['PASSENGER'], 'throw');
  const { items, total } = await readBookings(session.user.id, {
    status: ctx.query.get('status') ?? '',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 10),
  });
  return { message: 'Success', data: { items, total } };
});
