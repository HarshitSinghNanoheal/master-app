-- CreateTable
CREATE TABLE "priviledges" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "priviledges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "priviledges_userId_tenantId_key" ON "priviledges"("userId", "tenantId");

-- AddForeignKey
ALTER TABLE "priviledges" ADD CONSTRAINT "priviledges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priviledges" ADD CONSTRAINT "priviledges_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
