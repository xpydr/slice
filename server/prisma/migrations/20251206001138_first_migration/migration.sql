-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditLogAction" AS ENUM ('LICENSE_CREATED', 'LICENSE_ACTIVATED', 'LICENSE_VALIDATED', 'LICENSE_SUSPENDED', 'LICENSE_REVOKED', 'LICENSE_REACTIVATED', 'PRODUCT_CREATED', 'PLAN_CREATED', 'KEY_GENERATED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('LICENSE', 'PRODUCT', 'PLAN', 'ACTIVATION');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxSeats" INTEGER,
    "maxDevices" INTEGER,
    "expiresInDays" INTEGER,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "maxSeats" INTEGER,
    "maxDevices" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "features" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activations" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "installId" TEXT NOT NULL,
    "deviceId" TEXT,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "activations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditLogAction" NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "performedBy" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "licenses_key_key" ON "licenses"("key");

-- CreateIndex
CREATE INDEX "licenses_key_idx" ON "licenses"("key");

-- CreateIndex
CREATE INDEX "licenses_planId_idx" ON "licenses"("planId");

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE INDEX "activations_licenseId_idx" ON "activations"("licenseId");

-- CreateIndex
CREATE INDEX "activations_installId_idx" ON "activations"("installId");

-- CreateIndex
CREATE UNIQUE INDEX "activations_licenseId_installId_key" ON "activations"("licenseId", "installId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activations" ADD CONSTRAINT "activations_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
