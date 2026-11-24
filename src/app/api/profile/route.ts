import { readProfile } from '@/features/user/services';
import { apiHandler, ApiError, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type Profile = NonNullable<Awaited<ReturnType<typeof readProfile>>>;
export type GetProfileResponse = ApiResponse<Profile>;

export const GET = apiHandler(async (): Promise<GetProfileResponse> => {
  const session = await authorized('*', 'throw');
  const profile = await readProfile(session.user.id);
  if (!profile) throw new ApiError('NOT_FOUND', 'Profil tidak ditemukan', 404);
  return { message: 'Success', data: profile };
});
