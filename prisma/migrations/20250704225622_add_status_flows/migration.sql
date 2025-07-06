/*
  Warnings:

  - You are about to drop the column `issueTypeId` on the `states` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `states` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `states` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[statusFlowId,name]` on the table `states` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `statusFlowId` to the `states` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "states" DROP CONSTRAINT "states_issueTypeId_fkey";

-- DropForeignKey
ALTER TABLE "states" DROP CONSTRAINT "states_teamId_fkey";

-- DropForeignKey
ALTER TABLE "states" DROP CONSTRAINT "states_workspaceId_fkey";

-- DropIndex
DROP INDEX "states_issueTypeId_idx";

-- DropIndex
DROP INDEX "states_teamId_idx";

-- DropIndex
DROP INDEX "states_teamId_name_key";

-- DropIndex
DROP INDEX "states_workspaceId_idx";

-- AlterTable
ALTER TABLE "issue_types" ADD COLUMN     "statusFlowId" TEXT;

-- AlterTable
ALTER TABLE "states" DROP COLUMN "issueTypeId",
DROP COLUMN "teamId",
DROP COLUMN "workspaceId",
ADD COLUMN     "statusFlowId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "status_flows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "icon" TEXT,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_flows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "status_flows_workspaceId_idx" ON "status_flows"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "status_flows_workspaceId_name_key" ON "status_flows"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "issue_types_statusFlowId_idx" ON "issue_types"("statusFlowId");

-- CreateIndex
CREATE INDEX "states_statusFlowId_idx" ON "states"("statusFlowId");

-- CreateIndex
CREATE UNIQUE INDEX "states_statusFlowId_name_key" ON "states"("statusFlowId", "name");

-- AddForeignKey
ALTER TABLE "status_flows" ADD CONSTRAINT "status_flows_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_statusFlowId_fkey" FOREIGN KEY ("statusFlowId") REFERENCES "status_flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_types" ADD CONSTRAINT "issue_types_statusFlowId_fkey" FOREIGN KEY ("statusFlowId") REFERENCES "status_flows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
