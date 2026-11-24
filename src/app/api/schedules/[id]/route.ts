import { readSchedule } from '@/features/schedule/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetScheduleResponse = ApiResponse<
  Awaited<ReturnType<typeof readSchedule>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetScheduleResponse> => {
  await authorized(['ADMIN'], 'throw');
  const data = await readSchedule(ctx.params.id);
  return { message: 'Success', data };
});
