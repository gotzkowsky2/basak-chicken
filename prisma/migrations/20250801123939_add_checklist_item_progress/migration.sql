-- CreateTable
CREATE TABLE "ChecklistItemProgress" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItemProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItemProgress_instanceId_itemId_key" ON "ChecklistItemProgress"("instanceId", "itemId");

-- AddForeignKey
ALTER TABLE "ChecklistItemProgress" ADD CONSTRAINT "ChecklistItemProgress_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ChecklistInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItemProgress" ADD CONSTRAINT "ChecklistItemProgress_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
