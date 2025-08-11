-- CreateEnum
CREATE TYPE "FavoriteTarget" AS ENUM ('MANUAL', 'PRECAUTION');

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "targetType" "FavoriteTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favorite_employeeId_targetType_idx" ON "Favorite"("employeeId", "targetType");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_employeeId_targetType_targetId_key" ON "Favorite"("employeeId", "targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
