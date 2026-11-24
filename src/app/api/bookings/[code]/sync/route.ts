import { syncBookingPayment } from '@/features/booking/services';
import { apiHandler } from '@/lib/api';
import { authorized } from '@/lib/auth';

export const POST = apiHandler(async (_, ctx) => {
  const session = await authorized(['PASSENGER'], 'throw');
  await syncBookingPayment(session.user.id, ctx.params.code);
  return { message: 'Status diperbarui', data: undefined };
});
