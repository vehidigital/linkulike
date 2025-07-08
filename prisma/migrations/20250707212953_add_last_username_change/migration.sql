/*
  Warnings:

  - You are about to drop the column `buttonTextColor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingCompleted` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "textColorOverride" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "buttonTextColor",
DROP COLUMN "onboardingCompleted",
ADD COLUMN     "lastUsernameChange" TIMESTAMP(3);
