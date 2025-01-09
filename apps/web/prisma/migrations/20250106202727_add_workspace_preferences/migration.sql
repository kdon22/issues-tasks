/*
  Warnings:

  - You are about to drop the `UserPreferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPreferences" DROP CONSTRAINT "UserPreferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPreferences" DROP CONSTRAINT "UserPreferences_workspaceId_fkey";

-- DropTable
DROP TABLE "UserPreferences";

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultHomeView" TEXT NOT NULL DEFAULT 'my-issues',
    "fontSize" TEXT NOT NULL DEFAULT 'default',
    "interfaceTheme" TEXT NOT NULL DEFAULT 'system',
    "usePointerCursor" BOOLEAN NOT NULL DEFAULT false,
    "displayFullNames" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "defaultHomeView" TEXT NOT NULL DEFAULT 'active-issues',
    "fontSize" TEXT NOT NULL DEFAULT 'default',
    "displayFullNames" BOOLEAN NOT NULL DEFAULT false,
    "interfaceTheme" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "workspace_user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_user_preferences_userId_workspaceId_key" ON "workspace_user_preferences"("userId", "workspaceId");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_user_preferences" ADD CONSTRAINT "workspace_user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_user_preferences" ADD CONSTRAINT "workspace_user_preferences_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
