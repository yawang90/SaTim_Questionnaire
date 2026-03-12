-- AddForeignKey
ALTER TABLE "surveyInstance" ADD CONSTRAINT "surveyInstance_twoTierQuestion_fkey" FOREIGN KEY ("twoTierQuestion") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
