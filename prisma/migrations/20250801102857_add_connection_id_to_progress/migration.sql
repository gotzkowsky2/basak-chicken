/*
  Warnings:

  - You are about to drop the column `inventoryItemId` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `TimeSlotChecklistStatus` table. All the data in the column will be lost.
  - You are about to drop the column `lockedAt` on the `TimeSlotChecklistStatus` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `TimeSlotChecklistStatus` table. All the data in the column will be lost.
  - You are about to drop the `_ManualItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PrecautionItems` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[date,timeSlot,workplace]` on the table `TimeSlotChecklistStatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `TimeSlotChecklistStatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "_ManualItems" DROP CONSTRAINT "_ManualItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_ManualItems" DROP CONSTRAINT "_ManualItems_B_fkey";

-- DropForeignKey
ALTER TABLE "_PrecautionItems" DROP CONSTRAINT "_PrecautionItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_PrecautionItems" DROP CONSTRAINT "_PrecautionItems_B_fkey";

-- DropIndex
DROP INDEX "TimeSlotChecklistStatus_date_workplace_timeSlot_key";

-- AlterTable
ALTER TABLE "ChecklistInstance" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedBy" TEXT;

-- AlterTable
ALTER TABLE "ChecklistItem" DROP COLUMN "inventoryItemId";

-- AlterTable
ALTER TABLE "ConnectedItemProgress" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedBy" TEXT,
ADD COLUMN     "connectionId" TEXT;

-- AlterTable
ALTER TABLE "TimeSlotChecklistStatus" DROP COLUMN "isLocked",
DROP COLUMN "lockedAt",
DROP COLUMN "notes",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "date" SET DATA TYPE DATE;

-- DropTable
DROP TABLE "_ManualItems";

-- DropTable
DROP TABLE "_PrecautionItems";

-- CreateTable
CREATE TABLE "ChecklistItemConnection" (
    "id" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistItemConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosReport" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItemConnection_checklistItemId_itemType_itemId_key" ON "ChecklistItemConnection"("checklistItemId", "itemType", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlotChecklistStatus_date_timeSlot_workplace_key" ON "TimeSlotChecklistStatus"("date", "timeSlot", "workplace");

-- AddForeignKey
ALTER TABLE "ChecklistItemConnection" ADD CONSTRAINT "ChecklistItemConnection_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
