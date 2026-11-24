import { readTrips } from '@/features/trip/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetAdminTripsResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readTrips>>['items'][number]
>;

export const GET = apiHandler(
  async (_, ctx): Promise<GetAdminTripsResponse> => {
    await authorized(['ADMIN'], 'throw');
    const { items, total } = await readTrips({
      search: ctx.query.get('search') ?? '',
      status: ctx.query.get('status') ?? '',
      page: +(ctx.query.get('page') ?? 1),
      limit: +(ctx.query.get('limit') ?? 20),
    });
    return { message: 'Success', data: { items, total } };
  }
);
