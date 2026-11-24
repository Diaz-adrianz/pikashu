export { cn } from 'cn';

export const getInitials = (str?: string | null) => {
  return str
    ? str
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    : '-';
};
