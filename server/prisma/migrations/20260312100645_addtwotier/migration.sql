-- DropForeignKey
ALTER TABLE "public"."surveyInstance" DROP CONSTRAINT "surveyInstance_twoTierQuestion_fkey";

-- AlterTable
ALTER TABLE "questionAnswer" ADD COLUMN     "twoTierQuestionId" INTEGER,
ALTER COLUMN "solvingTimeStart" DROP NOT NULL,
ALTER COLUMN "solvingTimeStart" DROP DEFAULT;
