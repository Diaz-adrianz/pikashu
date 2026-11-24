import { Role } from '@/generated/prisma/enums';
import { Option } from '@/lib/option';

export const RoleOptionsMap: Record<Role, Option<Role>> = {
  ADMIN: { value: 'ADMIN', label: 'Admin' },
  STAFF: { value: 'STAFF', label: 'Staf' },
  PASSENGER: { value: 'PASSENGER', label: 'Penumpang' },
} as const;

export const RoleOptions = Object.values(RoleOptionsMap);

export const Roles = Object.keys(RoleOptionsMap) as Role[];
