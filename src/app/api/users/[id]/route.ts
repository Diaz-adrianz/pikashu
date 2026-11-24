import { readUser } from '@/features/user/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetUserResponse = ApiResponse<Awaited<ReturnType<typeof readUser>>>;

export const GET = apiHandler(async (_, ctx): Promise<GetUserResponse> => {
  await authorized(['ADMIN'], 'throw');

  const data = await readUser(ctx.params.id);
  return { message: 'Success', data };
});
