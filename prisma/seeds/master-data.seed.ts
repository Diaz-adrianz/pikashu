import { copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import {
  FleetStatus,
  OptionalServiceStatus,
  PrismaClient,
  RouteStatus,
  ScheduleStatus,
  SeatTier,
} from '@/generated/prisma/client';

const PLACEHOLDER = path.join(
  process.cwd(),
  'src/assets/images/img-placeholder.png'
);

function seedImage(dir: 'fleets' | 'facilities') {
  const directory = path.join(process.cwd(), 'uploads', dir);
  mkdirSync(directory, { recursive: true });

  const filename = `seed-placeholder.png`;
  const target = path.join(directory, filename);
  if (!existsSync(target)) copyFileSync(PLACEHOLDER, target);
  return `${dir}/${filename}`;
}

async function findOrCreate<T>(
  find: () => Promise<T | null>,
  create: () => Promise<T>
) {
  const existing = await find();
  if (existing) return { item: existing, created: false };
  return { item: await create(), created: true };
}

const fleets = [
  {
    id: 'seed-fleet-bus-economy',
    name: 'Bus Ekonomi 01',
    type: 'BUS' as const,
    seatTier: SeatTier.ECONOMY,
    price: 150000,
  },
  {
    id: 'seed-fleet-bus-business',
    name: 'Bus Bisnis 01',
    type: 'BUS' as const,
    seatTier: SeatTier.BUSINESS,
    price: 275000,
  },
  {
    id: 'seed-fleet-minibus-economy',
    name: 'Minibus Ekonomi 01',
    type: 'MINIBUS' as const,
    seatTier: SeatTier.ECONOMY,
    price: 120000,
  },
];

const facilities = [
  {
    id: 'seed-facility-economy-ac',
    seatTier: SeatTier.ECONOMY,
    title: 'AC',
    description: 'Kabin ber-AC dengan suhu nyaman sepanjang perjalanan.',
  },
  {
    id: 'seed-facility-economy-wifi',
    seatTier: SeatTier.ECONOMY,
    title: 'Wi-Fi',
    description: 'Akses internet gratis di dalam armada.',
  },
  {
    id: 'seed-facility-business-reclining',
    seatTier: SeatTier.BUSINESS,
    title: 'Kursi Reclining',
    description: 'Kursi luas dengan sandaran yang dapat direbahkan.',
  },
  {
    id: 'seed-facility-business-snack',
    seatTier: SeatTier.BUSINESS,
    title: 'Snack',
    description: 'Camilan dan minuman ringan selama perjalanan.',
  },
];

const services = [
  {
    id: 'seed-service-meal',
    name: 'Makanan',
    description: 'Paket makanan utama dengan pilihan menu harian.',
    price: 35000,
    capacity: 20,
  },
  {
    id: 'seed-service-water',
    name: 'Air Mineral',
    description: 'Botol air mineral 600 ml.',
    price: 10000,
    capacity: null,
  },
  {
    id: 'seed-service-blanket',
    name: 'Selimut',
    description: 'Selimut tambahan untuk perjalanan malam.',
    price: 15000,
    capacity: 10,
  },
];

const routes = [
  {
    id: 'seed-route-bandung-jakarta',
    name: 'Bandung – Jakarta',
    originCity: 'Bandung',
    destinationCity: 'Jakarta',
    originLat: -6.9175,
    originLng: 107.6191,
    destinationLat: -6.2088,
    destinationLng: 106.8456,
    durationMinutes: 180,
    path: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [107.6191, -6.9175],
          [107.1894, -6.5443],
          [106.8456, -6.2088],
        ],
      },
    },
  },
  {
    id: 'seed-route-jakarta-bandung',
    name: 'Jakarta – Bandung',
    originCity: 'Jakarta',
    destinationCity: 'Bandung',
    originLat: -6.2088,
    originLng: 106.8456,
    destinationLat: -6.9175,
    destinationLng: 107.6191,
    durationMinutes: 180,
    path: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.8456, -6.2088],
          [107.1894, -6.5443],
          [107.6191, -6.9175],
        ],
      },
    },
  },
  {
    id: 'seed-route-jakarta-yogyakarta',
    name: 'Jakarta – Yogyakarta',
    originCity: 'Jakarta',
    destinationCity: 'Yogyakarta',
    originLat: -6.2088,
    originLng: 106.8456,
    destinationLat: -7.7956,
    destinationLng: 110.3695,
    durationMinutes: 480,
    path: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.8456, -6.2088],
          [108.5, -7.25],
          [110.3695, -7.7956],
        ],
      },
    },
  },
];

const schedules = [
  {
    id: 'seed-schedule-bdj-jkt-eco-0700',
    route: 'seed-route-bandung-jakarta',
    fleet: 'seed-fleet-bus-economy',
    departureTime: '07:00',
  },
  {
    id: 'seed-schedule-bdj-jkt-eco-1500',
    route: 'seed-route-bandung-jakarta',
    fleet: 'seed-fleet-bus-economy',
    departureTime: '15:00',
  },
  {
    id: 'seed-schedule-bdj-jkt-bis-0900',
    route: 'seed-route-bandung-jakarta',
    fleet: 'seed-fleet-bus-business',
    departureTime: '09:00',
  },
  {
    id: 'seed-schedule-bdj-jkt-mini-0630',
    route: 'seed-route-bandung-jakarta',
    fleet: 'seed-fleet-minibus-economy',
    departureTime: '06:30',
  },
  {
    id: 'seed-schedule-jkt-bdj-eco-0800',
    route: 'seed-route-jakarta-bandung',
    fleet: 'seed-fleet-bus-economy',
    departureTime: '08:00',
  },
  {
    id: 'seed-schedule-jkt-bdj-eco-1600',
    route: 'seed-route-jakarta-bandung',
    fleet: 'seed-fleet-bus-economy',
    departureTime: '16:00',
  },
  {
    id: 'seed-schedule-jkt-yog-bis-1800',
    route: 'seed-route-jakarta-yogyakarta',
    fleet: 'seed-fleet-bus-business',
    departureTime: '18:00',
  },
];

export async function seedMasterData(prisma: PrismaClient) {
  console.log('🌱 Master data seeding...');

  const fleetImage = seedImage('fleets');
  const facilityImage = seedImage('facilities');
  let created = 0;

  for (const fleet of fleets) {
    const result = await findOrCreate(
      () => prisma.fleet.findFirst({ where: { name: fleet.name } }),
      () =>
        prisma.fleet.create({
          data: {
            ...fleet,
            status: FleetStatus.ACTIVE,
            description: `${fleet.name} untuk layanan antar kota.`,
          },
        })
    );
    if (result.created) created++;

    if (result.created) {
      await prisma.fleetImage.create({
        data: { fleetId: result.item.id, path: fleetImage, isMain: true },
      });
    }
  }

  for (const facility of facilities) {
    const result = await findOrCreate(
      () =>
        prisma.facility.findFirst({
          where: { title: facility.title, seatTier: facility.seatTier },
        }),
      () => prisma.facility.create({ data: { ...facility, image: facilityImage } })
    );
    if (result.created) created++;
  }

  for (const service of services) {
    const result = await findOrCreate(
      () => prisma.optionalService.findFirst({ where: { name: service.name } }),
      () =>
        prisma.optionalService.create({
          data: { ...service, status: OptionalServiceStatus.ACTIVE },
        })
    );
    if (result.created) created++;
  }

  const routeIds = new Map<string, string>();
  for (const route of routes) {
    const result = await findOrCreate(
      () => prisma.route.findFirst({ where: { name: route.name } }),
      () =>
        prisma.route.create({
          data: { ...route, status: RouteStatus.ACTIVE, path: route.path },
        })
    );
    if (result.created) created++;
    routeIds.set(route.id, result.item.id);
  }

  const fleetIds = new Map<string, string>();
  for (const fleet of fleets) {
    const item = await prisma.fleet.findFirstOrThrow({
      where: { name: fleet.name },
      select: { id: true },
    });
    fleetIds.set(fleet.id, item.id);
  }

  for (const schedule of schedules) {
    const routeId = routeIds.get(schedule.route)!;
    const fleetId = fleetIds.get(schedule.fleet)!;
    const result = await findOrCreate(
      () =>
        prisma.schedule.findUnique({
          where: {
            routeId_fleetId_departureTime: {
              routeId,
              fleetId,
              departureTime: schedule.departureTime,
            },
          },
        }),
      () =>
        prisma.schedule.create({
          data: {
            id: schedule.id,
            routeId,
            fleetId,
            departureTime: schedule.departureTime,
            status: ScheduleStatus.ACTIVE,
          },
        })
    );
    if (result.created) created++;
  }

  const total =
    fleets.length +
    facilities.length +
    services.length +
    routes.length +
    schedules.length;
  console.log(`${total} data; ${created} created; ${total - created} skipped.`);
}
