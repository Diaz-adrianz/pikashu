import { FleetType } from '@/generated/prisma/enums';

export type Seat = {
  number: string;
  row: number;
  column: number;
};

export type SeatLayout = {
  type: FleetType;
  rows: number;
  columns: number;
  aisleAfter: number;
  seats: Seat[];
};

function build(type: FleetType, rows: number, columns: number): SeatLayout {
  return {
    type,
    rows,
    columns,
    aisleAfter: columns / 2,
    seats: Array.from({ length: rows * columns }, (_, i) => ({
      number: String(i + 1),
      row: Math.floor(i / columns) + 1,
      column: (i % columns) + 1,
    })),
  };
}

// ponytail: exact coordinates are unspecified. Rows x columns is the ceiling.
export const SEAT_LAYOUTS: Record<FleetType, SeatLayout> = {
  BUS: build('BUS', 10, 4),
  MINIBUS: build('MINIBUS', 4, 4),
};

export const getSeatLayout = (type: FleetType) => SEAT_LAYOUTS[type];
export const getSeatCapacity = (type: FleetType) => SEAT_LAYOUTS[type].seats.length;
