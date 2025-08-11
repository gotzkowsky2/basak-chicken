/*
  Warnings:

  - A unique constraint covering the columns `[templateId,date]` on the table `ChecklistInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ChecklistInstance_workplace_timeSlot_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistInstance_templateId_date_key" ON "ChecklistInstance"("templateId", "date");
