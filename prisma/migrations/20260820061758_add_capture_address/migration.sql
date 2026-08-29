/*
  Warnings:

  - A unique constraint covering the columns `[user_code]` on the table `guard_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "captureAddress" TEXT;

-- AlterTable
ALTER TABLE "guard_profiles" ADD COLUMN     "user_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "guard_profiles_user_code_key" ON "guard_profiles"("user_code");
