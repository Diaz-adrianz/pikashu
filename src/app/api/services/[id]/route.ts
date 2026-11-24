import { readService } from '@/features/optional-service/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetServiceResponse = ApiResponse<
  Awaited<ReturnType<typeof readService>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetServiceResponse> => {
  await authorized(['ADMIN'], 'throw');

  const data = await readService(ctx.params.id);
  return { message: 'Success', data };
});
