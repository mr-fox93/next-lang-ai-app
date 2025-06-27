-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "translate_category" TEXT;

-- Update existing "pro" difficulty level to "advanced"
UPDATE "Flashcard" SET "difficultyLevel" = 'advanced' WHERE "difficultyLevel" = 'pro';
