/*
  Warnings:

  - You are about to drop the column `icon` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `iconColor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "icon",
DROP COLUMN "iconColor",
ADD COLUMN     "avatarColor" TEXT,
ADD COLUMN     "avatarIcon" TEXT,
ADD COLUMN     "avatarImageUrl" TEXT,
ADD COLUMN     "avatarType" TEXT NOT NULL DEFAULT 'initials',
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "firstDayOfWeek" TEXT NOT NULL DEFAULT 'Monday',
ADD COLUMN     "useEmoticons" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "defaultHomeView" SET DEFAULT 'active-issues';

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "icon",
ADD COLUMN     "avatarColor" TEXT,
ADD COLUMN     "avatarIcon" TEXT,
ADD COLUMN     "avatarImageUrl" TEXT,
ADD COLUMN     "avatarType" TEXT NOT NULL DEFAULT 'initials';
