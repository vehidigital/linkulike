-- AlterTable
ALTER TABLE "User" ADD COLUMN     "showShareButton" BOOLEAN DEFAULT false,
ADD COLUMN     "socialPosition" TEXT DEFAULT 'bottom';
