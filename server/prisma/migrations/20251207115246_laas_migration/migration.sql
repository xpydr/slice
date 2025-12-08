-- LaaS Migration: Convert to multi-tenant Licensing as a Service platform

-- Step 1: Create new enums (idempotent)
DO $$ BEGIN
    CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing enums
ALTER TYPE "AuditLogAction" ADD VALUE 'TENANT_CREATED';
ALTER TYPE "AuditLogAction" ADD VALUE 'TENANT_UPDATED';
ALTER TYPE "AuditLogAction" ADD VALUE 'TENANT_SUSPENDED';
ALTER TYPE "AuditLogAction" ADD VALUE 'API_KEY_CREATED';
ALTER TYPE "AuditLogAction" ADD VALUE 'API_KEY_REVOKED';
ALTER TYPE "AuditLogAction" ADD VALUE 'USER_CREATED';
ALTER TYPE "AuditLogAction" ADD VALUE 'USER_UPDATED';
ALTER TYPE "AuditLogAction" ADD VALUE 'LICENSE_ASSIGNED';

ALTER TYPE "EntityType" ADD VALUE 'TENANT';
ALTER TYPE "EntityType" ADD VALUE 'API_KEY';
ALTER TYPE "EntityType" ADD VALUE 'USER';

-- Step 2: Create tenants table (idempotent)
CREATE TABLE IF NOT EXISTS "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tenants_status_idx" ON "tenants"("status");

-- Step 3: Create tenant_api_keys table (idempotent)
CREATE TABLE IF NOT EXISTS "tenant_api_keys" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_api_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenant_api_keys_keyHash_key" ON "tenant_api_keys"("keyHash");
CREATE INDEX IF NOT EXISTS "tenant_api_keys_tenantId_idx" ON "tenant_api_keys"("tenantId");
CREATE INDEX IF NOT EXISTS "tenant_api_keys_keyHash_idx" ON "tenant_api_keys"("keyHash");

-- Step 4: Create users table (idempotent)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_tenantId_externalId_key" ON "users"("tenantId", "externalId");
CREATE INDEX IF NOT EXISTS "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX IF NOT EXISTS "users_tenantId_externalId_idx" ON "users"("tenantId", "externalId");

-- Step 5: Create user_licenses table (idempotent)
CREATE TABLE IF NOT EXISTS "user_licenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "user_licenses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_licenses_userId_licenseId_key" ON "user_licenses"("userId", "licenseId");
CREATE INDEX IF NOT EXISTS "user_licenses_userId_idx" ON "user_licenses"("userId");
CREATE INDEX IF NOT EXISTS "user_licenses_licenseId_idx" ON "user_licenses"("licenseId");

-- Step 6: Create a default tenant for existing data (idempotent)
INSERT INTO "tenants" ("id", "name", "status", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'Default Tenant', 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "tenants" WHERE "name" = 'Default Tenant');

-- Step 7: Add tenantId to products (nullable first, idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tenantId') THEN
        ALTER TABLE "products" ADD COLUMN "tenantId" TEXT;
    END IF;
END $$;

-- Step 8: Assign existing products to default tenant
UPDATE "products" 
SET "tenantId" = (SELECT "id" FROM "tenants" WHERE "name" = 'Default Tenant' LIMIT 1)
WHERE "tenantId" IS NULL;

-- Step 9: Make tenantId required on products (idempotent)
DO $$ 
BEGIN
    ALTER TABLE "products" ALTER COLUMN "tenantId" SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;
CREATE INDEX IF NOT EXISTS "products_tenantId_idx" ON "products"("tenantId");

-- Step 10: Remove key column from licenses (we'll drop the unique constraint first)
DROP INDEX IF EXISTS "licenses_key_key";
DROP INDEX IF EXISTS "licenses_key_idx";
ALTER TABLE "licenses" DROP COLUMN IF EXISTS "key";

-- Step 11: Update activations table - add userId, remove installId (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activations' AND column_name='userId') THEN
        ALTER TABLE "activations" ADD COLUMN "userId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activations' AND column_name='deviceInfo') THEN
        ALTER TABLE "activations" ADD COLUMN "deviceInfo" JSONB;
    END IF;
END $$;

-- Step 12: Create temporary users for existing activations (if any)
-- This handles the case where there are existing activations
-- We'll create a user for each unique installId
INSERT INTO "users" ("id", "tenantId", "externalId", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    (SELECT "id" FROM "tenants" WHERE "name" = 'Default Tenant' LIMIT 1),
    "installId",
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT "installId" 
    FROM "activations" 
    WHERE "installId" IS NOT NULL
) AS unique_installs
ON CONFLICT ("tenantId", "externalId") DO NOTHING;

-- Step 13: Update activations to use userId
UPDATE "activations" a
SET "userId" = (
    SELECT u."id" 
    FROM "users" u 
    WHERE u."externalId" = a."installId" 
    AND u."tenantId" = (SELECT "id" FROM "tenants" WHERE "name" = 'Default Tenant' LIMIT 1)
    LIMIT 1
)
WHERE a."installId" IS NOT NULL;

-- Step 14: Remove old installId column and constraints
DROP INDEX IF EXISTS "activations_installId_idx";
DROP INDEX IF EXISTS "activations_licenseId_installId_key";
ALTER TABLE "activations" DROP COLUMN IF EXISTS "installId";

-- Step 15: Make userId required and add new constraints (idempotent)
DO $$ 
BEGIN
    ALTER TABLE "activations" ALTER COLUMN "userId" SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "activations_userId_licenseId_deviceId_key" ON "activations"("userId", "licenseId", "deviceId");
CREATE INDEX IF NOT EXISTS "activations_userId_idx" ON "activations"("userId");
CREATE INDEX IF NOT EXISTS "activations_userId_licenseId_idx" ON "activations"("userId", "licenseId");

-- Step 16: Update audit_logs to add tenantId (nullable, idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='tenantId') THEN
        ALTER TABLE "audit_logs" ADD COLUMN "tenantId" TEXT;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- Step 17: Add foreign key constraints (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_api_keys_tenantId_fkey') THEN
        ALTER TABLE "tenant_api_keys" ADD CONSTRAINT "tenant_api_keys_tenantId_fkey" 
            FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_tenantId_fkey') THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_tenantId_fkey" 
            FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_tenantId_fkey') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" 
            FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_licenses_userId_fkey') THEN
        ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_licenses_licenseId_fkey') THEN
        ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_licenseId_fkey" 
            FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activations_userId_fkey') THEN
        ALTER TABLE "activations" ADD CONSTRAINT "activations_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_tenantId_fkey') THEN
        ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" 
            FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
