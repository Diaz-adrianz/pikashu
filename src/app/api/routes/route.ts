import { readRoutes } from '@/features/route/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetRoutesResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readRoutes>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetRoutesResponse> => {
  await authorized(['ADMIN'], 'throw');

  const { items, total } = await readRoutes({
    search: ctx.query.get('search') ?? '',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 20),
  });
  return { message: 'Success', data: { items, total } };
});
