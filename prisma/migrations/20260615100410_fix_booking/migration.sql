/*
  Warnings:

  - You are about to drop the column `tier_id` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tier_id` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_tier_id_fkey";

-- DropIndex
DROP INDEX "tickets_tier_id_idx";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "tier_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "tier_id";

-- CreateIndex
CREATE INDEX "bookings_tier_id_idx" ON "bookings"("tier_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "ticket_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
