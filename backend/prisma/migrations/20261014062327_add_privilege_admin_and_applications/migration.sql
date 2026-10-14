-- CreateEnum
CREATE TYPE "Application" AS ENUM ('RESOLV', 'USTOR', 'VAPT');

-- AlterTable
ALTER TABLE "priviledges" ADD COLUMN     "applications" "Application"[] DEFAULT ARRAY[]::"Application"[],
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;
