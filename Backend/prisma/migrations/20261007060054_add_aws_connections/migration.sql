-- CreateTable
CREATE TABLE "AWSConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "roleArn" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AWSConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AWSConnection_userId_idx" ON "AWSConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AWSConnection_userId_accountId_key" ON "AWSConnection"("userId", "accountId");

-- AddForeignKey
ALTER TABLE "AWSConnection" ADD CONSTRAINT "AWSConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
