/*
  Warnings:

  - You are about to drop the column `deviceId` on the `activations` table. All the data in the column will be lost.
  - You are about to drop the column `deviceInfo` on the `activations` table. All the data in the column will be lost.
  - You are about to drop the column `maxDevices` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `maxDevices` on the `plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,licenseId]` on the table `activations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "activations_userId_licenseId_deviceId_key";

-- AlterTable
ALTER TABLE "activations" DROP COLUMN "deviceId",
DROP COLUMN "deviceInfo";

-- AlterTable
ALTER TABLE "licenses" DROP COLUMN "maxDevices";

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "maxDevices";

-- CreateIndex
CREATE UNIQUE INDEX "activations_userId_licenseId_key" ON "activations"("userId", "licenseId");
