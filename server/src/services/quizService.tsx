import type { JsonValue } from "@prisma/client/runtime/library";
import prisma from "../config/prismaClient.js";

export interface QuizQuestion {
    id: number;
    contentJson?: any;
    contentHtml?: string | null;
    correctAnswers?: any;
}

export interface NextQuestion {
    surveyId: number;
    surveyTitle: string;
    instanceId: number;
    bookletId: number;
    question: QuizQuestion | null;
    answerId: number;
    totalQuestions: number;
    answeredQuestions: number;
}

export async function getQuiz(instanceId: string, userId: string): Promise<NextQuestion> {
    const instance = await prisma.surveyInstance.findUnique({
        where: {id: Number(instanceId)},
    });
    if (!instance) throw new Error("Survey instance not found");
    const survey = await prisma.survey.findUnique({
        where: {id: instance.surveyId},
    });
    if (!survey) throw new Error("Survey not found");
    let answerRecord = await prisma.answer.findFirst({
        where: {
            surveyId: survey.id,
            instanceId: instance.id,
            userId,
        },
        include: {
            questionsAnswers: true,
        },
    });

    if (!answerRecord) {
        const booklet = await assignBookletToUser(survey.id);

        answerRecord = await prisma.answer.create({
            data: {
                surveyId: survey.id,
                instanceId: instance.id,
                bookletId: booklet.id,
                userId,
                questionIds: booklet.questions.map(q => q.id),
            },
            include: {
                questionsAnswers: true,
            },
        });
    }
    const nextQuestion = await getNextUnansweredQuestion(answerRecord);

    if (nextQuestion) {
        await prisma.questionAnswer.upsert({
            where: {
                answerId_questionId: {
                    answerId: answerRecord.id,
                    questionId: nextQuestion.id,
                },
            },
            create: {
                answerId: answerRecord.id,
                questionId: nextQuestion.id,
            },
            update: {},
        });
    }
    const totalQuestions = answerRecord.questionIds.length;
    const answeredQuestions = answerRecord.questionsAnswers.filter(
        qa => qa.answerJson !== null
    ).length;

    return {
        surveyId: survey.id,
        surveyTitle: survey.title,
        instanceId: instance.id,
        bookletId: answerRecord.bookletId,
        question: nextQuestion,
        answerId: answerRecord.id,
        totalQuestions,
        answeredQuestions
    };
}

export async function submitQuizAnswer(userId: string, questionId: number, answerJson: any) {
}

async function getNextUnansweredQuestion(answerRecord: { questionsAnswers: { id: number; createdAt: Date; answerId: number; questionId: number; answerJson: JsonValue | null; solvedTime: Date | null; solvingTimeStart: Date; solvingTimeEnd: Date | null; }[]; } & { id: number; surveyId: number; createdAt: Date; updatedAt: Date; instanceId: number; bookletId: number; userId: string; questionIds: number[]; }): Promise<QuizQuestion | null> {
    const answeredQuestionIds = new Set(
        answerRecord.questionsAnswers
            .filter(qa => qa.answerJson !== null)
            .map(qa => qa.questionId)
    );

    const unansweredQuestionId = answerRecord.questionIds.find(
        questionId => !answeredQuestionIds.has(questionId)
    );

    if (!unansweredQuestionId) {
        return null;
    }

    const question = await prisma.question.findUnique({
        where: { id: unansweredQuestionId },
    });

    if (!question) {
        return null;
    }

    return {
        id: question.id,
        contentJson: question.contentJson,
        contentHtml: question.contentHtml,
        correctAnswers: question.correctAnswers,
    };
}

async function assignBookletToUser(surveyId: number) {
    return prisma.$transaction(async tx => {
        const booklets = await tx.booklet.findMany({
            where: { surveyId },
            include: { questions: true },
        });

        if (booklets.length === 0) {
            throw new Error("No booklets found");
        }

        const minAssigned = Math.min(...booklets.map(b => b.assignedCount));
        const leastAssigned = booklets.filter(
            b => b.assignedCount === minAssigned
        );

        const selected =
            leastAssigned[Math.floor(Math.random() * leastAssigned.length)];
        if (!selected) throw new Error("No selected booklet");
        await tx.booklet.update({
            where: { id: selected.id },
            data: { assignedCount: { increment: 1 } },
        });

        return selected;
    });
}

