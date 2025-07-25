/*
  Warnings:

  - You are about to drop the column `itemId` on the `ChecklistItemResponse` table. All the data in the column will be lost.
  - You are about to drop the column `checklistId` on the `ChecklistSubmission` table. All the data in the column will be lost.
  - You are about to drop the `Checklist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChecklistItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `templateId` to the `ChecklistItemResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `ChecklistSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSlot` to the `ChecklistSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplace` to the `ChecklistSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Workplace" AS ENUM ('HALL', 'KITCHEN', 'COMMON');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CHECKLIST', 'PRECAUTIONS', 'HYGIENE', 'SUPPLIES', 'INGREDIENTS', 'COMMON', 'MANUAL');

-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('PREPARATION', 'IN_PROGRESS', 'CLOSING', 'COMMON');

-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_checklistId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItemResponse" DROP CONSTRAINT "ChecklistItemResponse_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistSubmission" DROP CONSTRAINT "ChecklistSubmission_checklistId_fkey";

-- AlterTable
ALTER TABLE "ChecklistItemResponse" DROP COLUMN "itemId",
ADD COLUMN     "templateId" TEXT NOT NULL,
ALTER COLUMN "isCompleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ChecklistSubmission" DROP COLUMN "checklistId",
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "templateId" TEXT NOT NULL,
ADD COLUMN     "timeSlot" "TimeSlot" NOT NULL,
ADD COLUMN     "workplace" "Workplace" NOT NULL;

-- DropTable
DROP TABLE "Checklist";

-- DropTable
DROP TABLE "ChecklistItem";

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "inputter" TEXT NOT NULL,
    "inputDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workplace" "Workplace" NOT NULL,
    "category" "Category" NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChecklistSubmission" ADD CONSTRAINT "ChecklistSubmission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItemResponse" ADD CONSTRAINT "ChecklistItemResponse_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
