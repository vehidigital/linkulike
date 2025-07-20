-- AlterTable
ALTER TABLE "User" ADD COLUMN     "backgroundOverlayColor" TEXT,
ADD COLUMN     "backgroundOverlayOpacity" DOUBLE PRECISION,
ADD COLUMN     "backgroundOverlayType" TEXT,
ADD COLUMN     "originalBackgroundImageUrl" TEXT;
