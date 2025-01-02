-- Add avatar fields to User, Workspace and Team tables
ALTER TABLE "User" 
ADD COLUMN "avatarType" TEXT NOT NULL DEFAULT 'initials',
ADD COLUMN "avatarIcon" TEXT,
ADD COLUMN "avatarColor" TEXT,
ADD COLUMN "avatarImageUrl" TEXT;

ALTER TABLE "Workspace"
ADD COLUMN "avatarType" TEXT NOT NULL DEFAULT 'initials',
ADD COLUMN "avatarIcon" TEXT,
ADD COLUMN "avatarColor" TEXT,
ADD COLUMN "avatarImageUrl" TEXT;

ALTER TABLE "Team"
ADD COLUMN "avatarType" TEXT NOT NULL DEFAULT 'initials',
ADD COLUMN "avatarIcon" TEXT,
ADD COLUMN "avatarColor" TEXT,
ADD COLUMN "avatarImageUrl" TEXT;

-- Drop old icon columns if they exist
ALTER TABLE "Team"
DROP COLUMN IF EXISTS "icon",
DROP COLUMN IF EXISTS "iconColor"; 