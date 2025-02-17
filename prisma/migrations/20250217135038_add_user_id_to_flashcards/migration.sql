/*
  Warnings:

  - Added the required column `userId` to the `Flashcard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "userId" TEXT NOT NULL;
