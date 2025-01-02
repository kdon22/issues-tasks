-- Add avatar fields to User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarType";
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarIcon";
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarColor";
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarImageUrl";

ALTER TABLE "User" ADD COLUMN "avatarType" TEXT NOT NULL DEFAULT 'initials';
ALTER TABLE "User" ADD COLUMN "avatarIcon" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarColor" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarImageUrl" TEXT;

-- Add avatar fields to Workspace table
ALTER TABLE "Workspace" DROP COLUMN IF EXISTS "avatarType";
ALTER TABLE "Workspace" DROP COLUMN IF EXISTS "avatarIcon";
ALTER TABLE "Workspace" DROP COLUMN IF EXISTS "avatarColor";
ALTER TABLE "Workspace" DROP COLUMN IF EXISTS "avatarImageUrl";

ALTER TABLE "Workspace" ADD COLUMN "avatarType" TEXT NOT NULL DEFAULT 'initials';
ALTER TABLE "Workspace" ADD COLUMN "avatarIcon" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "avatarColor" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "avatarImageUrl" TEXT;

-- Add avatar fields to Team table
ALTER TABLE "Team" DROP COLUMN IF EXISTS "avatarType";
ALTER TABLE "Team" DROP COLUMN IF EXISTS "avatarIcon";
ALTER TABLE "Team" DROP COLUMN IF EXISTS "avatarColor";
ALTER TABLE "Team" DROP COLUMN IF EXISTS "avatarImageUrl";

ALTER TABLE "Team" ADD COLUMN "avatarType" TEXT NOT NULL DEFAULT 'initials';
ALTER TABLE "Team" ADD COLUMN "avatarIcon" TEXT;
ALTER TABLE "Team" ADD COLUMN "avatarColor" TEXT;
ALTER TABLE "Team" ADD COLUMN "avatarImageUrl" TEXT;

-- Add description to Team table
ALTER TABLE "Team" ADD COLUMN "description" TEXT;

-- Create Issue table
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for Issue table
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index on teamId
CREATE INDEX "Issue_teamId_idx" ON "Issue"("teamId"); 