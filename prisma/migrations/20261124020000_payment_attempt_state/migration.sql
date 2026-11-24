ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CREATING';

ALTER TABLE "refunds" ADD COLUMN "idempotency_key" TEXT;
UPDATE "refunds" SET "idempotency_key" = 'legacy-' || "id" WHERE "idempotency_key" IS NULL;
ALTER TABLE "refunds" ALTER COLUMN "idempotency_key" SET NOT NULL;
CREATE UNIQUE INDEX "refunds_idempotency_key_key" ON "refunds"("idempotency_key");
