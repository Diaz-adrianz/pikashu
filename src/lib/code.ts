import { randomBytes } from 'crypto';

const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length = 8) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHANUMERIC[b % ALPHANUMERIC.length]).join('');
}

export const generateBookingCode = () => `PKH-${randomCode()}`;
export const generateTicketCode = () => `TKT-${randomCode()}`;
export const generateQrToken = () => randomBytes(32).toString('base64url');
