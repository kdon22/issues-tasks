-- DropIndex
DROP INDEX "states_statusFlowId_name_key";

-- AlterTable
ALTER TABLE "states" ALTER COLUMN "statusFlowId" DROP NOT NULL;
