/*
  Warnings:

  - You are about to drop the column `subCategory` on the `ChecklistTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChecklistTemplate" DROP COLUMN "subCategory";

-- DropEnum
DROP TYPE "SubCategory";

-- CreateTable
CREATE TABLE "ChecklistTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateTagRelation" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateTagRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TemplateTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TemplateTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistTag_name_key" ON "ChecklistTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateTagRelation_templateId_tagId_key" ON "TemplateTagRelation"("templateId", "tagId");

-- CreateIndex
CREATE INDEX "_TemplateTags_B_index" ON "_TemplateTags"("B");

-- AddForeignKey
ALTER TABLE "TemplateTagRelation" ADD CONSTRAINT "TemplateTagRelation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateTagRelation" ADD CONSTRAINT "TemplateTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ChecklistTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateTags" ADD CONSTRAINT "_TemplateTags_A_fkey" FOREIGN KEY ("A") REFERENCES "ChecklistTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateTags" ADD CONSTRAINT "_TemplateTags_B_fkey" FOREIGN KEY ("B") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
