export const getInitials = (str?: string | null) => {
  return str
    ? str
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    : '-';
};

export const formatMoney = (
  number: number | string,
  { locale = 'id-ID', currency = 'IDR' } = {}
) => {
  try {
    number = +number;
  } catch {
    return '';
  }

  let formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(number);

  if (formatted.includes(',')) formatted = formatted.replace(/,00$/, '');

  return formatted;
};

const DEFAULT_CHARSET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const randomString = ({
  length = 16,
  charset = DEFAULT_CHARSET,
}: {
  length?: number;
  charset?: string;
} = {}): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => charset[b % charset.length]).join('');
};

export const toSlug = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
