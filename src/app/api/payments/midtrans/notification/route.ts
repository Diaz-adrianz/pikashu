import { apiHandler, ApiError } from '@/lib/api';
import { processNotification } from '@/features/booking/services';
import { verifyMidtransSignature } from '@/lib/midtrans';

type Notification = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  gross_amount?: string;
  signature_key?: string;
  status_code?: string;
  transaction_id?: string;
  payment_type?: string;
  refund_id?: string;
};

export const POST = apiHandler(async (request) => {
  const body = (await request.json()) as Notification;

  if (
    !body.order_id ||
    !body.transaction_status ||
    !body.gross_amount ||
    !body.signature_key ||
    !body.status_code
  )
    throw new ApiError('INVALID_PAYLOAD', 'Notifikasi tidak lengkap', 400);

  const valid = verifyMidtransSignature({
    orderId: body.order_id,
    statusCode: body.status_code,
    grossAmount: body.gross_amount,
    signatureKey: body.signature_key,
  });
  if (!valid)
    throw new ApiError('INVALID_SIGNATURE', 'Signature tidak valid', 403);

  await processNotification({
    order_id: body.order_id,
    transaction_status: body.transaction_status,
    fraud_status: body.fraud_status,
    gross_amount: body.gross_amount,
    signature_key: body.signature_key,
    status_code: body.status_code,
    transaction_id: body.transaction_id,
    payment_type: body.payment_type,
    refund_id: body.refund_id,
  });

  return { message: 'OK', data: undefined };
});
