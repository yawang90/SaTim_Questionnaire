import { Prisma } from "@prisma/client";
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

interface SubmitQuizAnswerParams {
    surveyId: number;
    instanceId: number;
    bookletId: number;
    userId: string;
    questionId: number;
    answerJson: any;
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

    let answerRecord = await prisma.answer.findFirst({
        where: {
            surveyId: survey.id,
            instanceId: instance.id,
            bookletId: selectedBooklet.id,
            userId,
        },
    });

    if (!answerRecord) {
        answerRecord = await prisma.answer.create({
            data: {
                surveyId: survey.id,
                instanceId: instance.id,
                bookletId: selectedBooklet.id,
                userId,
            },
        });
    }

    return {
        surveyId: survey.id,
        surveyTitle: survey.title,
        instanceId: instance.id,
        bookletId: selectedBooklet.id,
        questions,
        answerId: answerRecord.id,
    };
}

export async function submitQuizAnswer({surveyId, instanceId, bookletId, userId, questionId, answerJson,}: SubmitQuizAnswerParams) {
    try {
        const answer = await prisma.answer.findUnique({
            where: {
                surveyId_instanceId_bookletId_userId: {
                    surveyId,
                    instanceId,
                    bookletId,
                    userId,
                },
            },
        });

        if (!answer) {
            throw new Error("ANSWER_NOT_FOUND");
        }

        const userAnswer = await prisma.userAnswer.create({
            data: {
                answerId: answer.id,
                questionId,
                answerJson,
            },
        });

        return {
            answerId: answer.id,
            userAnswerId: userAnswer.id,
        };
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {throw new Error("QUESTION_ALREADY_ANSWERED");}
        throw err;
    }
}
