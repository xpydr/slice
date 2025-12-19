-- CreateTable
CREATE TABLE "stripe_plan_mappings" (
    "id" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxLicenses" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_plan_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_license_tracking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "maxLicenses" INTEGER NOT NULL,
    "usedLicenses" INTEGER NOT NULL DEFAULT 0,
    "subscriptionStatus" "SubscriptionStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_license_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_plan_mappings_stripePriceId_key" ON "stripe_plan_mappings"("stripePriceId");

-- CreateIndex
CREATE INDEX "stripe_plan_mappings_stripePriceId_idx" ON "stripe_plan_mappings"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_license_tracking_tenantId_key" ON "subscription_license_tracking"("tenantId");

-- CreateIndex
CREATE INDEX "subscription_license_tracking_tenantId_idx" ON "subscription_license_tracking"("tenantId");

-- CreateIndex
CREATE INDEX "subscription_license_tracking_stripeSubscriptionId_idx" ON "subscription_license_tracking"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscription_license_tracking_stripePriceId_idx" ON "subscription_license_tracking"("stripePriceId");

-- CreateIndex
CREATE INDEX "subscription_license_tracking_subscriptionStatus_idx" ON "subscription_license_tracking"("subscriptionStatus");

-- AddForeignKey
ALTER TABLE "subscription_license_tracking" ADD CONSTRAINT "subscription_license_tracking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
