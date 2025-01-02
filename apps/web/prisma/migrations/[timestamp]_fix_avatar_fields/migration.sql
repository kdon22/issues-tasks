-- Drop existing avatar columns if they exist
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarType";
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarIcon";
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarColor";
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarImageUrl";

-- Add avatar columns with proper defaults
ALTER TABLE "User" ADD COLUMN "avatarType" TEXT NOT NULL DEFAULT 'initials';
ALTER TABLE "User" ADD COLUMN "avatarIcon" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarColor" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarImageUrl" TEXT; 