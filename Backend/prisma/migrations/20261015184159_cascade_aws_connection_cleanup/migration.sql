-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "RemediationAction" DROP CONSTRAINT "RemediationAction_findingId_fkey";

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemediationAction" ADD CONSTRAINT "RemediationAction_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
