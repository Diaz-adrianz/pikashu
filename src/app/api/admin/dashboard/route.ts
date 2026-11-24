import { getAdminSummary } from '@/features/admin/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetAdminDashboardResponse = ApiResponse<
  Awaited<ReturnType<typeof getAdminSummary>>
>;

export const GET = apiHandler(async (): Promise<GetAdminDashboardResponse> => {
  await authorized(['ADMIN'], 'throw');
  const data = await getAdminSummary();
  return { message: 'Success', data };
});
