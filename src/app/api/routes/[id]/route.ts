import { readRoute } from '@/features/route/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetRouteResponse = ApiResponse<
  Awaited<ReturnType<typeof readRoute>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetRouteResponse> => {
  await authorized(['ADMIN'], 'throw');

  const data = await readRoute(ctx.params.id);
  return { message: 'Success', data };
});
