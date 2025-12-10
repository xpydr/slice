-- CreateTable
CREATE TABLE "tenant_sessions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "tenant_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_sessions_tokenHash_key" ON "tenant_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "tenant_sessions_tenantId_idx" ON "tenant_sessions"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_sessions_tokenHash_idx" ON "tenant_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "tenant_sessions_expiresAt_idx" ON "tenant_sessions"("expiresAt");

-- AddForeignKey
ALTER TABLE "tenant_sessions" ADD CONSTRAINT "tenant_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
