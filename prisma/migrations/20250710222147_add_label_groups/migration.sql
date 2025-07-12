/*
  Warnings:

  - You are about to drop the column `parentId` on the `labels` table. All the data in the column will be lost.
  - Added the required column `workspaceId` to the `states` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "labels" DROP CONSTRAINT "labels_parentId_fkey";

-- DropIndex
DROP INDEX "labels_parentId_idx";

-- AlterTable
ALTER TABLE "labels" DROP COLUMN "parentId",
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "states" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "label_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "position" INTEGER NOT NULL DEFAULT 0,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "label_groups_workspaceId_idx" ON "label_groups"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "label_groups_workspaceId_name_key" ON "label_groups"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "labels_groupId_idx" ON "labels"("groupId");

-- CreateIndex
CREATE INDEX "states_workspaceId_idx" ON "states"("workspaceId");

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_groups" ADD CONSTRAINT "label_groups_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "label_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
