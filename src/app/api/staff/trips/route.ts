import { readAssignedTrips } from '@/features/ticket/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetStaffTripsResponse = ApiResponse<
  Awaited<ReturnType<typeof readAssignedTrips>>
>;

export const GET = apiHandler(async (): Promise<GetStaffTripsResponse> => {
  const session = await authorized(['STAFF'], 'throw');
  const data = await readAssignedTrips(session.user.id);
  return { message: 'Success', data };
});
