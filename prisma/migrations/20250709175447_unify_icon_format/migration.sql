/*
  Warnings:

  - You are about to drop the column `avatarEmoji` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `avatarIcon` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `avatarImageUrl` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `avatarType` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "avatarEmoji",
DROP COLUMN "avatarIcon",
DROP COLUMN "avatarImageUrl",
DROP COLUMN "avatarType",
ADD COLUMN     "icon" TEXT;
