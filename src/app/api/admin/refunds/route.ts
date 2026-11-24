import { readRefunds } from '@/features/booking/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetAdminRefundsResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readRefunds>>['items'][number]
>;

export const GET = apiHandler(
  async (_, ctx): Promise<GetAdminRefundsResponse> => {
    await authorized(['ADMIN'], 'throw');
    const { items, total } = await readRefunds({
      page: +(ctx.query.get('page') ?? 1),
      limit: +(ctx.query.get('limit') ?? 10),
    });
    return { message: 'Success', data: { items, total } };
  }
);
