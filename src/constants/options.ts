import {
  FleetStatus,
  FleetType,
  Role,
  SeatTier,
  UserStatus,
} from '@/generated/prisma/enums';
import { Option } from '@/lib/option';

export const RoleOptionsMap: Record<Role, Option<Role>> = {
  ADMIN: { value: 'ADMIN', label: 'Admin' },
  STAFF: { value: 'STAFF', label: 'Staf' },
  PASSENGER: { value: 'PASSENGER', label: 'Penumpang' },
} as const;

export const RoleOptions = Object.values(RoleOptionsMap);

export const Roles = Object.keys(RoleOptionsMap) as Role[];

export const UserStatusOptionsMap: Record<UserStatus, Option<UserStatus>> = {
  ACTIVE: { value: 'ACTIVE', label: 'Aktif' },
  DISABLED: { value: 'DISABLED', label: 'Nonaktif' },
} as const;

export const UserStatusOptions = Object.values(UserStatusOptionsMap);

export const FleetTypeOptionsMap: Record<FleetType, Option<FleetType>> = {
  BUS: { value: 'BUS', label: 'Bus' },
  MINIBUS: { value: 'MINIBUS', label: 'Minibus' },
} as const;

export const FleetTypeOptions = Object.values(FleetTypeOptionsMap);

export const FleetStatusOptionsMap: Record<FleetStatus, Option<FleetStatus>> = {
  ACTIVE: { value: 'ACTIVE', label: 'Aktif' },
  INACTIVE: { value: 'INACTIVE', label: 'Nonaktif' },
} as const;

export const FleetStatusOptions = Object.values(FleetStatusOptionsMap);

export const SeatTierOptionsMap: Record<SeatTier, Option<SeatTier>> = {
  ECONOMY: { value: 'ECONOMY', label: 'Ekonomi' },
  BUSINESS: { value: 'BUSINESS', label: 'Bisnis' },
} as const;

export const SeatTierOptions = Object.values(SeatTierOptionsMap);
