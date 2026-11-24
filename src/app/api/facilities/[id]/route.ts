import { readFacility } from '@/features/facility/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetFacilityResponse = ApiResponse<
  Awaited<ReturnType<typeof readFacility>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetFacilityResponse> => {
  await authorized(['ADMIN'], 'throw');

  const data = await readFacility(ctx.params.id);
  return { message: 'Success', data };
});
