/*
  Warnings:

  - A unique constraint covering the columns `[awsConnectionId,type,name]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "awsConnectionId" TEXT;

-- CreateIndex
CREATE INDEX "Resource_awsConnectionId_idx" ON "Resource"("awsConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_awsConnectionId_type_name_key" ON "Resource"("awsConnectionId", "type", "name");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_awsConnectionId_fkey" FOREIGN KEY ("awsConnectionId") REFERENCES "AWSConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
