import { readSchedules } from '@/features/schedule/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetSchedulesResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readSchedules>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetSchedulesResponse> => {
  await authorized(['ADMIN'], 'throw');
  const { items, total } = await readSchedules({
    search: ctx.query.get('search') ?? '',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 20),
  });
  return { message: 'Success', data: { items, total } };
});
