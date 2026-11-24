import { searchTrips } from '@/features/trip/services';
import { apiHandler, ApiResponsePaginate } from '@/lib/api';

export type GetTripsResponse = ApiResponsePaginate<
  Awaited<ReturnType<typeof searchTrips>>['items'][number]
>;

export const GET = apiHandler(async (_, ctx): Promise<GetTripsResponse> => {
  const { items, total } = await searchTrips({
    originCity: ctx.query.get('originCity') ?? '',
    destinationCity: ctx.query.get('destinationCity') ?? '',
    departureDate: ctx.query.get('departureDate') ?? '',
    seats: +(ctx.query.get('seats') ?? 1),
    seatTier: ctx.query.get('seatTier') ?? '',
    sort: ctx.query.get('sort') ?? 'departure_asc',
    page: +(ctx.query.get('page') ?? 1),
    limit: +(ctx.query.get('limit') ?? 10),
  });
  return { message: 'Success', data: { items, total } };
});
