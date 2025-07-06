/*
  Warnings:

  - You are about to drop the column `order` on the `Link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Link" DROP COLUMN "order",
ADD COLUMN     "icon" TEXT DEFAULT 'globe',
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "backgroundColor" TEXT DEFAULT '#000000',
ADD COLUMN     "backgroundGradient" TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
ADD COLUMN     "buttonColor" TEXT DEFAULT '#ffffff',
ADD COLUMN     "buttonGradient" TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
ADD COLUMN     "buttonStyle" TEXT DEFAULT 'gradient',
ADD COLUMN     "fontFamily" TEXT DEFAULT 'Inter',
ADD COLUMN     "textColor" TEXT DEFAULT '#ffffff';
