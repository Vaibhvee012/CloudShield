-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "awsConnectionId" TEXT;

-- CreateIndex
CREATE INDEX "Finding_awsConnectionId_idx" ON "Finding"("awsConnectionId");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_awsConnectionId_fkey" FOREIGN KEY ("awsConnectionId") REFERENCES "AWSConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
