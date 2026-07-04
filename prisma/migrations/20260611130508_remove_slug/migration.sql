/*
  Warnings:

  - You are about to drop the column `slug` on the `event_categories` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `events` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "event_categories_slug_key";

-- DropIndex
DROP INDEX "events_slug_key";

-- AlterTable
ALTER TABLE "event_categories" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "slug";
