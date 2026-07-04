/*
  Warnings:

  - You are about to drop the `event_approvals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_approvals" DROP CONSTRAINT "event_approvals_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_approvals" DROP CONSTRAINT "event_approvals_reviewed_by_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMPTZ,
ADD COLUMN     "reviewed_by" UUID;

-- DropTable
DROP TABLE "event_approvals";

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
