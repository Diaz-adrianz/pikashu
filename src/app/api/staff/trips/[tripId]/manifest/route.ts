import { readStaffManifest } from '@/features/ticket/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetStaffManifestResponse = ApiResponse<
  Awaited<ReturnType<typeof readStaffManifest>>
>;

export const GET = apiHandler(
  async (_, ctx): Promise<GetStaffManifestResponse> => {
    const session = await authorized(['STAFF'], 'throw');
    const data = await readStaffManifest(session.user.id, ctx.params.tripId);
    return { message: 'Success', data };
  }
);
