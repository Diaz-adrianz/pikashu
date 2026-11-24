export { cn } from 'cn';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export const getInitials = (str?: string | null) => {
  return str
    ? str
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    : '-';
};
