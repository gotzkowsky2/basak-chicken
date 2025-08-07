-- CreateTable
CREATE TABLE "ManualPrecautionRelation" (
    "id" TEXT NOT NULL,
    "manualId" TEXT NOT NULL,
    "precautionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualPrecautionRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ManualPrecautions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManualPrecautions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManualPrecautionRelation_manualId_precautionId_key" ON "ManualPrecautionRelation"("manualId", "precautionId");

-- CreateIndex
CREATE INDEX "_ManualPrecautions_B_index" ON "_ManualPrecautions"("B");

-- AddForeignKey
ALTER TABLE "ManualPrecautionRelation" ADD CONSTRAINT "ManualPrecautionRelation_manualId_fkey" FOREIGN KEY ("manualId") REFERENCES "Manual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualPrecautionRelation" ADD CONSTRAINT "ManualPrecautionRelation_precautionId_fkey" FOREIGN KEY ("precautionId") REFERENCES "Precaution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManualPrecautions" ADD CONSTRAINT "_ManualPrecautions_A_fkey" FOREIGN KEY ("A") REFERENCES "Manual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManualPrecautions" ADD CONSTRAINT "_ManualPrecautions_B_fkey" FOREIGN KEY ("B") REFERENCES "Precaution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
