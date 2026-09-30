-- CreateTable
CREATE TABLE "SyncStatus" (
    "id" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncStatus_pkey" PRIMARY KEY ("id")
);
