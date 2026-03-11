-- AlterTable
ALTER TABLE "surveyInstance" ADD COLUMN     "isTwoTier" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoTierQuestion" INTEGER;
