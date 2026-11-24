import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  generateBookingCode,
  generateQrToken,
  generateTicketCode,
} from '../src/lib/code';
import { verifyMidtransSignature } from '../src/lib/midtrans';
import { getSeatLayout } from '../src/features/trip/seat-layout';

for (const [type, count] of [
  ['BUS', 40],
  ['MINIBUS', 16],
] as const) {
  const layout = getSeatLayout(type);
  assert.equal(layout.seats.length, count);
  assert.equal(new Set(layout.seats.map((seat) => seat.number)).size, count);
}

assert.match(generateBookingCode(), /^PKH-[A-HJ-NP-Z2-9]{8}$/);
assert.match(generateTicketCode(), /^TKT-[A-HJ-NP-Z2-9]{8}$/);
assert.match(generateQrToken(), /^[A-Za-z0-9_-]{43}$/);

process.env.MIDTRANS_SERVER_KEY = 'self-check-key';
const orderId = 'PKH-ABCDEFGH';
const statusCode = '200';
const grossAmount = '10000';
const signatureKey = createHash('sha512')
  .update(`${orderId}${statusCode}${grossAmount}self-check-key`)
  .digest('hex');

assert.equal(
  verifyMidtransSignature({ orderId, statusCode, grossAmount, signatureKey }),
  true
);
assert.equal(
  verifyMidtransSignature({
    orderId,
    statusCode,
    grossAmount,
    signatureKey: 'bad',
  }),
  false
);

console.log('self-check OK');
