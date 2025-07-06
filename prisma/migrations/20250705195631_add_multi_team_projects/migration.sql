-- CreateEnum
CREATE TYPE "ProjectTeamRole" AS ENUM ('LEAD', 'MEMBER');

-- CreateTable
CREATE TABLE "project_teams" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "ProjectTeamRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_teams_projectId_idx" ON "project_teams"("projectId");

-- CreateIndex
CREATE INDEX "project_teams_teamId_idx" ON "project_teams"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "project_teams_projectId_teamId_key" ON "project_teams"("projectId", "teamId");

-- AddForeignKey
ALTER TABLE "project_teams" ADD CONSTRAINT "project_teams_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_teams" ADD CONSTRAINT "project_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
