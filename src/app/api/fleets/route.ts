import { readFleets } from '@/features/fleet/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetFleetsResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readFleets>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetFleetsResponse> => {
  await authorized(['ADMIN'], 'throw');

  const { items, total } = await readFleets({
    search: ctx.query.get('search') ?? '',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 20),
  });
  return { message: 'Success', data: { items, total } };
});
