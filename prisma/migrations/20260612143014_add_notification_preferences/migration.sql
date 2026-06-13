-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "digestFrequency" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "notifyOnSubmission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "notificationCooldown" TEXT NOT NULL DEFAULT '15min',
ADD COLUMN     "lastNotificationSent" TIMESTAMP(3),
ADD COLUMN     "unsubscribeToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projects_unsubscribeToken_key" ON "projects"("unsubscribeToken");
