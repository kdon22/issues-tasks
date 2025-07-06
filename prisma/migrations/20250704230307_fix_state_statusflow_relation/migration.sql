/*
  Warnings:

  - A unique constraint covering the columns `[statusFlowId,name]` on the table `states` will be added. If there are existing duplicate values, this will fail.
  - Made the column `statusFlowId` on table `states` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "states" ALTER COLUMN "statusFlowId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "states_statusFlowId_name_key" ON "states"("statusFlowId", "name");
