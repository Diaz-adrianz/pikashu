-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OptionalServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('VALID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BoardingStatus" AS ENUM ('NOT_BOARDED', 'BOARDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "seat_tier" "SeatTier" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin_city" TEXT NOT NULL,
    "destination_city" TEXT NOT NULL,
    "origin_lat" DOUBLE PRECISION NOT NULL,
    "origin_lng" DOUBLE PRECISION NOT NULL,
    "destination_lat" DOUBLE PRECISION NOT NULL,
    "destination_lng" DOUBLE PRECISION NOT NULL,
    "path" JSONB,
    "duration_minutes" INTEGER NOT NULL,
    "status" "RouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "fleet_id" TEXT NOT NULL,
    "departure_time" TEXT NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "fleet_id" TEXT NOT NULL,
    "departure_at" TIMESTAMP(3) NOT NULL,
    "arrival_at" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "seat_tier" "SeatTier" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "facilities" JSONB NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_optional_services" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "capacity" INTEGER,

    CONSTRAINT "trip_optional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optional_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "capacity" INTEGER,
    "status" "OptionalServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "optional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_staff" (
    "trip_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_staff_pkey" PRIMARY KEY ("trip_id","staff_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "total_amount" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_optional_services" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "trip_optional_service_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "booking_optional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "seat_number" TEXT NOT NULL,
    "passenger_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'VALID',
    "boarding_status" "BoardingStatus" NOT NULL DEFAULT 'NOT_BOARDED',
    "boarded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT,
    "redirect_url" TEXT,
    "transaction_id" TEXT,
    "method" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "provider_refund_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "facilities_seat_tier_idx" ON "facilities"("seat_tier");

-- CreateIndex
CREATE INDEX "routes_status_idx" ON "routes"("status");

-- CreateIndex
CREATE INDEX "routes_origin_city_destination_city_idx" ON "routes"("origin_city", "destination_city");

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "schedules"("status");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_route_id_fleet_id_departure_time_key" ON "schedules"("route_id", "fleet_id", "departure_time");

-- CreateIndex
CREATE INDEX "trips_status_departure_at_idx" ON "trips"("status", "departure_at");

-- CreateIndex
CREATE INDEX "trips_route_id_idx" ON "trips"("route_id");

-- CreateIndex
CREATE INDEX "trips_fleet_id_idx" ON "trips"("fleet_id");

-- CreateIndex
CREATE UNIQUE INDEX "trips_schedule_id_departure_at_key" ON "trips"("schedule_id", "departure_at");

-- CreateIndex
CREATE INDEX "trip_optional_services_service_id_idx" ON "trip_optional_services"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_optional_services_trip_id_service_id_key" ON "trip_optional_services"("trip_id", "service_id");

-- CreateIndex
CREATE INDEX "optional_services_status_idx" ON "optional_services"("status");

-- CreateIndex
CREATE INDEX "trip_staff_staff_id_idx" ON "trip_staff"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_code_key" ON "bookings"("code");

-- CreateIndex
CREATE INDEX "bookings_user_id_created_at_idx" ON "bookings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "bookings_trip_id_status_idx" ON "bookings"("trip_id", "status");

-- CreateIndex
CREATE INDEX "bookings_status_expires_at_idx" ON "bookings"("status", "expires_at");

-- CreateIndex
CREATE INDEX "booking_optional_services_trip_optional_service_id_idx" ON "booking_optional_services"("trip_optional_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_optional_services_booking_id_service_id_key" ON "booking_optional_services"("booking_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_qr_token_key" ON "tickets"("qr_token");

-- CreateIndex
CREATE INDEX "tickets_trip_id_seat_number_idx" ON "tickets"("trip_id", "seat_number");

-- CreateIndex
CREATE INDEX "tickets_booking_id_idx" ON "tickets"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_fleet_id_fkey" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_fleet_id_fkey" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_optional_services" ADD CONSTRAINT "trip_optional_services_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_optional_services" ADD CONSTRAINT "trip_optional_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "optional_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_staff" ADD CONSTRAINT "trip_staff_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_staff" ADD CONSTRAINT "trip_staff_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_optional_services" ADD CONSTRAINT "booking_optional_services_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_optional_services" ADD CONSTRAINT "booking_optional_services_trip_optional_service_id_fkey" FOREIGN KEY ("trip_optional_service_id") REFERENCES "trip_optional_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_optional_services" ADD CONSTRAINT "booking_optional_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "optional_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A seat can only be held by one active (VALID) ticket per trip.
CREATE UNIQUE INDEX "tickets_trip_seat_valid_key" ON "tickets"("trip_id", "seat_number") WHERE "status" = 'VALID';
