-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "customColor" TEXT,
ADD COLUMN     "useCustomColor" BOOLEAN NOT NULL DEFAULT false;
