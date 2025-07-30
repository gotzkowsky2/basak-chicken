/*
  Warnings:

  - You are about to drop the `ChecklistItemResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChecklistSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChecklistTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateTagRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TemplateTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PURCHASED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "PurchasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- DropForeignKey
ALTER TABLE "ChecklistItemResponse" DROP CONSTRAINT "ChecklistItemResponse_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistItemResponse" DROP CONSTRAINT "ChecklistItemResponse_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistSubmission" DROP CONSTRAINT "ChecklistSubmission_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistSubmission" DROP CONSTRAINT "ChecklistSubmission_templateId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateTagRelation" DROP CONSTRAINT "TemplateTagRelation_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateTagRelation" DROP CONSTRAINT "TemplateTagRelation_templateId_fkey";

-- DropForeignKey
ALTER TABLE "_TemplateTags" DROP CONSTRAINT "_TemplateTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_TemplateTags" DROP CONSTRAINT "_TemplateTags_B_fkey";

-- AlterTable
ALTER TABLE "ChecklistTemplate" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "ChecklistItemResponse";

-- DropTable
DROP TABLE "ChecklistSubmission";

-- DropTable
DROP TABLE "ChecklistTag";

-- DropTable
DROP TABLE "TemplateTagRelation";

-- DropTable
DROP TABLE "_TemplateTags";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplateTagRelation" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistTemplateTagRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItemTagRelation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItemTagRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrecautionTagRelation" (
    "id" TEXT NOT NULL,
    "precautionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrecautionTagRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualTagRelation" (
    "id" TEXT NOT NULL,
    "manualId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualTagRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistInstance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "templateId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "workplace" "Workplace" NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "isReopened" BOOLEAN NOT NULL DEFAULT false,
    "reopenedAt" TIMESTAMP(3),
    "reopenedBy" TEXT,
    "reopenReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedItemProgress" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "currentStock" INTEGER,
    "updatedStock" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectedItemProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Precaution" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "workplace" "Workplace" NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Precaution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manual" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "workplace" "Workplace" NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "category" "Category" NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL,
    "minStock" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "supplier" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCheck" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "checkedBy" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStock" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "needsRestock" BOOLEAN NOT NULL DEFAULT false,
    "estimatedRestockDate" TIMESTAMP(3),

    CONSTRAINT "InventoryCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "PurchasePriority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedCost" DOUBLE PRECISION,
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequestItem" (
    "id" TEXT NOT NULL,
    "purchaseRequestId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "notes" TEXT,
    "purchasedBy" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),

    CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "parentId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "instructions" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inventoryItemId" TEXT,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlotChecklistStatus" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "workplace" "Workplace" NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlotChecklistStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChecklistTemplateTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChecklistTemplateTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PrecautionTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PrecautionTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ManualTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManualTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InventoryItemTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InventoryItemTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PrecautionItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PrecautionItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ManualItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManualItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistTemplateTagRelation_templateId_tagId_key" ON "ChecklistTemplateTagRelation"("templateId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItemTagRelation_itemId_tagId_key" ON "InventoryItemTagRelation"("itemId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "PrecautionTagRelation_precautionId_tagId_key" ON "PrecautionTagRelation"("precautionId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ManualTagRelation_manualId_tagId_key" ON "ManualTagRelation"("manualId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistInstance_workplace_timeSlot_date_key" ON "ChecklistInstance"("workplace", "timeSlot", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlotChecklistStatus_date_workplace_timeSlot_key" ON "TimeSlotChecklistStatus"("date", "workplace", "timeSlot");

-- CreateIndex
CREATE INDEX "_ChecklistTemplateTags_B_index" ON "_ChecklistTemplateTags"("B");

-- CreateIndex
CREATE INDEX "_PrecautionTags_B_index" ON "_PrecautionTags"("B");

-- CreateIndex
CREATE INDEX "_ManualTags_B_index" ON "_ManualTags"("B");

-- CreateIndex
CREATE INDEX "_InventoryItemTags_B_index" ON "_InventoryItemTags"("B");

-- CreateIndex
CREATE INDEX "_PrecautionItems_B_index" ON "_PrecautionItems"("B");

-- CreateIndex
CREATE INDEX "_ManualItems_B_index" ON "_ManualItems"("B");

-- AddForeignKey
ALTER TABLE "ChecklistTemplateTagRelation" ADD CONSTRAINT "ChecklistTemplateTagRelation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistTemplateTagRelation" ADD CONSTRAINT "ChecklistTemplateTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemTagRelation" ADD CONSTRAINT "InventoryItemTagRelation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemTagRelation" ADD CONSTRAINT "InventoryItemTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecautionTagRelation" ADD CONSTRAINT "PrecautionTagRelation_precautionId_fkey" FOREIGN KEY ("precautionId") REFERENCES "Precaution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecautionTagRelation" ADD CONSTRAINT "PrecautionTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualTagRelation" ADD CONSTRAINT "ManualTagRelation_manualId_fkey" FOREIGN KEY ("manualId") REFERENCES "Manual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualTagRelation" ADD CONSTRAINT "ManualTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistInstance" ADD CONSTRAINT "ChecklistInstance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistInstance" ADD CONSTRAINT "ChecklistInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistInstance" ADD CONSTRAINT "ChecklistInstance_reopenedBy_fkey" FOREIGN KEY ("reopenedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedItemProgress" ADD CONSTRAINT "ConnectedItemProgress_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ChecklistInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCheck" ADD CONSTRAINT "InventoryCheck_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCheck" ADD CONSTRAINT "InventoryCheck_checkedBy_fkey" FOREIGN KEY ("checkedBy") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_purchasedBy_fkey" FOREIGN KEY ("purchasedBy") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlotChecklistStatus" ADD CONSTRAINT "TimeSlotChecklistStatus_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistTemplateTags" ADD CONSTRAINT "_ChecklistTemplateTags_A_fkey" FOREIGN KEY ("A") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistTemplateTags" ADD CONSTRAINT "_ChecklistTemplateTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrecautionTags" ADD CONSTRAINT "_PrecautionTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Precaution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrecautionTags" ADD CONSTRAINT "_PrecautionTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManualTags" ADD CONSTRAINT "_ManualTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Manual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManualTags" ADD CONSTRAINT "_ManualTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InventoryItemTags" ADD CONSTRAINT "_InventoryItemTags_A_fkey" FOREIGN KEY ("A") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InventoryItemTags" ADD CONSTRAINT "_InventoryItemTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrecautionItems" ADD CONSTRAINT "_PrecautionItems_A_fkey" FOREIGN KEY ("A") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrecautionItems" ADD CONSTRAINT "_PrecautionItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Precaution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManualItems" ADD CONSTRAINT "_ManualItems_A_fkey" FOREIGN KEY ("A") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManualItems" ADD CONSTRAINT "_ManualItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Manual"("id") ON DELETE CASCADE ON UPDATE CASCADE;
