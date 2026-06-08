-- DropFlatWorkoutSession
DROP TABLE IF EXISTS "WorkoutSession";

-- CreateTable
CREATE TABLE "WorkoutDayPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutDayPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutMuscleGroup" (
    "id" TEXT NOT NULL,
    "dayPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timeMinutes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutMuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equipment" TEXT,
    "weightKg" DECIMAL(8,2),
    "series" INTEGER,
    "repsMin" INTEGER,
    "repsMax" INTEGER,
    "imageUrl" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutDayPlan_userId_weekday_idx" ON "WorkoutDayPlan"("userId", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDayPlan_userId_weekday_key" ON "WorkoutDayPlan"("userId", "weekday");

-- CreateIndex
CREATE INDEX "WorkoutMuscleGroup_dayPlanId_sortOrder_idx" ON "WorkoutMuscleGroup"("dayPlanId", "sortOrder");

-- CreateIndex
CREATE INDEX "WorkoutExercise_groupId_sortOrder_idx" ON "WorkoutExercise"("groupId", "sortOrder");

-- AddForeignKey
ALTER TABLE "WorkoutDayPlan" ADD CONSTRAINT "WorkoutDayPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutMuscleGroup" ADD CONSTRAINT "WorkoutMuscleGroup_dayPlanId_fkey" FOREIGN KEY ("dayPlanId") REFERENCES "WorkoutDayPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "WorkoutMuscleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
