-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "FleetType" AS ENUM ('BUS', 'MINIBUS');

-- CreateEnum
CREATE TYPE "FleetStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SeatTier" AS ENUM ('ECONOMY', 'BUSINESS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "fleets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "FleetType" NOT NULL,
    "status" "FleetStatus" NOT NULL DEFAULT 'ACTIVE',
    "seat_tier" "SeatTier" NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_images" (
    "id" TEXT NOT NULL,
    "fleet_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fleet_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fleets_status_idx" ON "fleets"("status");

-- CreateIndex
CREATE INDEX "fleet_images_fleet_id_idx" ON "fleet_images"("fleet_id");

-- AddForeignKey
ALTER TABLE "fleet_images" ADD CONSTRAINT "fleet_images_fleet_id_fkey" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
