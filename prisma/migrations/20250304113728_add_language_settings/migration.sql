-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "difficultyLevel" TEXT NOT NULL DEFAULT 'easy',
ADD COLUMN     "sourceLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "targetLanguage" TEXT NOT NULL DEFAULT 'pl';
