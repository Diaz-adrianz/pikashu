import { readUsers } from '@/features/user/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetUsersResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readUsers>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetUsersResponse> => {
  await authorized(['ADMIN'], 'throw');

  const { items, total } = await readUsers({
    search: ctx.query.get('search') ?? '',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 20),
  });
  return { message: 'Success', data: { items, total } };
});
