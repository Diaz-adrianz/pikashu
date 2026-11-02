import { readUsers } from '@/features/user/services';
import { apiHandler } from '@/infra/api/handler';
import { ApiResponsePaginate } from '@/infra/api/types';
import { authGuard } from '@/lib/next-auth/guards';

export type GetUsersResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readUsers>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetUsersResponse> => {
  await authGuard(['ADMIN'], 'throw');

  const data = await readUsers({
    search: ctx.query.get('search') ?? '',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 20),
  });
  return {
    message: 'Success',
    data: { items: data.items, total: data.count },
  };
});
