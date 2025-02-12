-- CreateTable
CREATE TABLE "Flashcard" (
    "id" SERIAL NOT NULL,
    "origin_text" TEXT NOT NULL,
    "translate_text" TEXT NOT NULL,
    "example_using" TEXT NOT NULL,
    "translate_example" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);
