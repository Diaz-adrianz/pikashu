import { createHash, timingSafeEqual } from 'crypto';

type SnapItem = { id?: string; name: string; quantity: number; price: number };
type SnapResponse = { token: string; redirect_url: string };

const isProduction = () => process.env.MIDTRANS_IS_PRODUCTION === 'true';

const snapBase = () =>
  isProduction()
    ? 'https://app.midtrans.com/snap/v1'
    : 'https://app.sandbox.midtrans.com/snap/v1';

const apiBase = () =>
  isProduction()
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2';

function headers() {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi');

  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`,
  };
}

function formatExpiry(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} +0700`;
}

export async function createSnapTransaction(input: {
  orderId: string;
  amount: number;
  expiresAt: Date;
  customer: { name: string; email: string; phone?: string | null };
  items: SnapItem[];
}): Promise<SnapResponse> {
  const app = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? '';
  const res = await fetch(`${snapBase()}/transactions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.amount,
      },
      credit_card: { secure: true },
      customer_details: input.customer,
      item_details: input.items,
      expiry: {
        start_time: formatExpiry(new Date()),
        duration: Math.max(
          1,
          Math.ceil((input.expiresAt.getTime() - Date.now()) / 60_000)
        ),
        unit: 'minutes',
      },
      callbacks: {
        finish: `${app}/booking/${input.orderId}`,
        unfinish: `${app}/booking/${input.orderId}/payment`,
        error: `${app}/booking/${input.orderId}/payment`,
      },
    }),
  });

  const body = await res.json();
  if (!res.ok)
    throw new Error(body?.error_messages?.[0] ?? 'Gagal membuat transaksi Midtrans');
  return body as SnapResponse;
}

export async function refundTransaction(input: {
  orderId: string;
  amount: number;
  reason: string;
  idempotencyKey: string;
}) {
  const res = await fetch(`${apiBase()}/${input.orderId}/refund`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      refund_key: input.idempotencyKey,
      amount: input.amount,
      reason: input.reason,
    }),
  });
  const body = await res.json();
  if (!res.ok)
    throw new Error(body?.error_messages?.[0] ?? 'Gagal mengajukan refund');
  return body as { status_code: string; status_message: string };
}

export async function getTransactionStatus(orderId: string) {
  const res = await fetch(`${apiBase()}/${orderId}/status`, {
    headers: headers(),
    cache: 'no-store',
  });
  const body = await res.json();
  if (!res.ok)
    throw new Error(body?.error_messages?.[0] ?? 'Gagal mengecek status pembayaran');
  return body as {
    status_code: string;
    transaction_status: string;
    fraud_status?: string;
    gross_amount: string;
    transaction_id?: string;
    payment_type?: string;
  };
}

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}) {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) return false;

  const expected = createHash('sha512')
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${key}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(input.signatureKey);
  return a.length === b.length && timingSafeEqual(a, b);
}
