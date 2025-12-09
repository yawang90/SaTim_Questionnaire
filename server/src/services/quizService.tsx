import prisma from "../config/prismaClient.js";

export interface QuizQuestion {
    id: number;
    contentJson?: any;
    contentHtml?: string | null;
    correctAnswers?: any;
}

export interface Quiz {
    surveyId: number;
    surveyTitle: string;
    instanceId: number;
    bookletId: number;
    questions: QuizQuestion[];
    answerId: number;
}

export async function getQuiz(instanceId: string, userId: string): Promise<Quiz> {
    const instance = await prisma.surveyInstance.findUnique({
        where: { id: Number(instanceId) },
    });

    if (!instance) throw new Error("Survey instance not found");

    const survey = await prisma.survey.findUnique({
        where: { id: instance.surveyId },
    });

    if (!survey) throw new Error("Survey not found");

    const booklets = await prisma.booklet.findMany({
        where: { surveyId: survey.id },
        include: { questions: true },
    });

    if (!booklets || booklets.length === 0) throw new Error("No booklets found for this survey");
    
    const randomIndex = Math.floor(Math.random() * booklets.length);
    const selectedBooklet = booklets[randomIndex];
    if (!selectedBooklet) throw new Error("Failed to select a booklet");
    const questions: QuizQuestion[] = selectedBooklet.questions.map((q) => ({
        id: q.id,
        contentJson: q.contentJson,
        contentHtml: q.contentHtml,
        correctAnswers: q.correctAnswers,
    }));

    const answerRecord = await prisma.answer.create({
        data: {
            surveyId: survey.id,
            instanceId: instance.id,
            bookletId: selectedBooklet.id,
            userId,
            answers: {},        },
    });
    return {
        surveyId: survey.id,
        surveyTitle: survey.title,
        instanceId: instance.id,
        bookletId: selectedBooklet.id,
        questions,
        answerId: answerRecord.id,
    };
}

