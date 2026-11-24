import { readFacilities } from '@/features/facility/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetFacilitiesResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof readFacilities>>['items'][number]
>;

export const GET = apiHandler(
  async (_, ctx): Promise<GetFacilitiesResponse> => {
    await authorized(['ADMIN'], 'throw');

    const { items, total } = await readFacilities({
      search: ctx.query.get('search') ?? '',
      page: +(ctx.query.get('page') ?? 1),
      limit: +(ctx.query.get('limit') ?? 20),
    });
    return { message: 'Success', data: { items, total } };
  }
);
