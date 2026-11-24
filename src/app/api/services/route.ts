import { readServices } from '@/features/optional-service/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetServicesResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readServices>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetServicesResponse> => {
  await authorized(['ADMIN'], 'throw');

  const { items, total } = await readServices({
    search: ctx.query.get('search') ?? '',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 20),
  });
  return { message: 'Success', data: { items, total } };
});
