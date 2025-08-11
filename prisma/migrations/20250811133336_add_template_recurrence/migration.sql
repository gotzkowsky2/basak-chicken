-- AlterTable
ALTER TABLE "ChecklistTemplate" ADD COLUMN     "autoGenerateEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "generationTime" TEXT,
ADD COLUMN     "recurrenceDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
