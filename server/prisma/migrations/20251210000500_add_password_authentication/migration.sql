/*
  Warnings:

  - Added the required column `passwordHash` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `tenants` required. This step will fail if there are existing NULL values in that column.

*/
-- Step 1: Add passwordHash column as nullable first
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Step 2: Set default password hash for existing tenants (temporary placeholder)
-- This uses a hash of a placeholder string that will need to be reset
UPDATE "tenants" 
SET "passwordHash" = '$argon2id$v=19$m=65536,t=3,p=4$placeholder$placeholder' 
WHERE "passwordHash" IS NULL;

-- Step 3: Set default email for existing tenants with NULL email
UPDATE "tenants" 
SET "email" = 'migrated-' || id || '@example.com' 
WHERE "email" IS NULL;

-- Step 4: Make passwordHash NOT NULL
ALTER TABLE "tenants" ALTER COLUMN "passwordHash" SET NOT NULL;

-- Step 5: Make email NOT NULL
ALTER TABLE "tenants" ALTER COLUMN "email" SET NOT NULL;

-- Step 6: Update default status to INACTIVE
ALTER TABLE "tenants" ALTER COLUMN "status" SET DEFAULT 'INACTIVE';
