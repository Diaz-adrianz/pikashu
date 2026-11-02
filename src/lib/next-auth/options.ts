import { Role } from '@/lib/prisma/generated/enums';
import { Option } from '@/types/option.type';

export const RoleOptionsMap: Record<Role, Option<Role>> = {
  ADMIN: { value: 'ADMIN', label: 'Admin' },
  USER: { value: 'USER', label: 'User' },
} as const;

export const RoleOptions = Object.values(RoleOptionsMap);

export const Roles = Object.keys(RoleOptionsMap) as Role[];
