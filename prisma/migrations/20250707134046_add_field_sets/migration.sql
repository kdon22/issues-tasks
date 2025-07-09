-- AlterTable
ALTER TABLE "issue_types" ADD COLUMN     "fieldSetId" TEXT;

-- CreateTable
CREATE TABLE "field_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_set_configurations" (
    "id" TEXT NOT NULL,
    "fieldSetId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "context" TEXT NOT NULL DEFAULT 'create',
    "showOnSubtask" BOOLEAN NOT NULL DEFAULT true,
    "showOnNewIssue" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_set_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "field_sets_workspaceId_idx" ON "field_sets"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "field_sets_workspaceId_name_key" ON "field_sets"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "field_set_configurations_fieldSetId_idx" ON "field_set_configurations"("fieldSetId");

-- CreateIndex
CREATE INDEX "field_set_configurations_fieldKey_idx" ON "field_set_configurations"("fieldKey");

-- CreateIndex
CREATE UNIQUE INDEX "field_set_configurations_fieldSetId_fieldKey_context_key" ON "field_set_configurations"("fieldSetId", "fieldKey", "context");

-- CreateIndex
CREATE INDEX "issue_types_fieldSetId_idx" ON "issue_types"("fieldSetId");

-- AddForeignKey
ALTER TABLE "issue_types" ADD CONSTRAINT "issue_types_fieldSetId_fkey" FOREIGN KEY ("fieldSetId") REFERENCES "field_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_sets" ADD CONSTRAINT "field_sets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_set_configurations" ADD CONSTRAINT "field_set_configurations_fieldSetId_fkey" FOREIGN KEY ("fieldSetId") REFERENCES "field_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
