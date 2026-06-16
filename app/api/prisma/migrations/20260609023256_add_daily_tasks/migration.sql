-- CreateEnum
CREATE TYPE "TaskSourceType" AS ENUM ('MANUAL', 'WORKOUT', 'DIET_MEAL');

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" "TaskSourceType" NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "logDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyTask_userId_weekday_sortOrder_idx" ON "DailyTask"("userId", "weekday", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTask_userId_weekday_sourceType_sourceId_key" ON "DailyTask"("userId", "weekday", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "TaskCompletion_taskId_logDate_idx" ON "TaskCompletion"("taskId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_taskId_logDate_key" ON "TaskCompletion"("taskId", "logDate");

-- AddForeignKey
ALTER TABLE "DailyTask" ADD CONSTRAINT "DailyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DailyTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
