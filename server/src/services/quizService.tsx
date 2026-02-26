import type { JsonValue } from "@prisma/client/runtime/library";
import prisma from "../config/prismaClient.js";
import type { Prisma } from "@prisma/client";

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
    questionIds: number[];
    answeredQuestionIds: number[];
    previousAnswer?: any;
    skipped: boolean;
    skippedQuestions: number[];
}

export async function getQuiz(instanceId: string, userId: string, questionId?: number): Promise<NextQuestion> {
    const instance = await prisma.surveyInstance.findUnique({
        where: {id: Number(instanceId)},
    });
    if (!instance) throw new Error("Testlauf nicht gefunden.");
    const now = new Date();
    if (now < instance.validFrom || now > instance.validTo) {
        throw new Error("NOT_ACTIVE")
    }
    const survey = await prisma.survey.findUnique({
        where: {id: instance.surveyId},
    });
    if (!survey) throw new Error("Test nicht gefunden.");
    let answerRecord = await prisma.answer.findFirst({
        where: { surveyId: survey.id, instanceId: instance.id, userId },
        include: { questionsAnswers: true, booklet: { include: { BookletQuestion: { orderBy: { position: "asc" } } } } },
    });
    if (!answerRecord) {
        const booklet = await assignBookletToUser(survey.id);
        answerRecord = await prisma.answer.create({
            data: {
                surveyId: survey.id,
                instanceId: instance.id,
                bookletId: booklet.id,
                userId,
                questionIds: booklet.BookletQuestion.map(bq => bq.question.id),
            },
            include: { questionsAnswers: true, booklet: { include: { BookletQuestion: true } } },
        });
    }
    let nextQuestion: QuizQuestion | null = null;
    if (questionId !== undefined) {
        const qa = await prisma.questionAnswer.upsert({
            where: {
                answerId_questionId: {
                    answerId: answerRecord.id,
                    questionId,
                },
            },
            create: {
                answerId: answerRecord.id,
                questionId,
            },
            update: {},
        });
        nextQuestion = await prisma.question.findUnique({ where: { id: questionId } });
    } else {
        nextQuestion = await getNextUnansweredQuestion(answerRecord);
    }

    let previousAnswer;
    if (nextQuestion) {
        previousAnswer = answerRecord.questionsAnswers.find(qa => qa.questionId === nextQuestion.id);
        const qaRecord = await prisma.questionAnswer.upsert({
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
        previousAnswer = qaRecord;
    }
    const answeredQuestionIds = answerRecord.questionsAnswers
        .filter(qa => qa.answerJson !== null)
        .map(qa => qa.questionId);
    const skippedQuestionIds = answerRecord.questionsAnswers
        .filter(qa => qa.skipped === true)
        .map(qa => qa.questionId);

    const totalQuestions = answerRecord.questionIds.length;
    const answeredQuestions = answeredQuestionIds.length;

    let cleanNextQuestion: QuizQuestion | null = nextQuestion ? {id: nextQuestion?.id, contentJson: nextQuestion?.contentJson} : null;
    return {
        surveyId: survey.id,
        surveyTitle: survey.title,
        instanceId: instance.id,
        bookletId: answerRecord.bookletId,
        question: cleanNextQuestion,
        answerId: answerRecord.id,
        totalQuestions,
        answeredQuestions,
        questionIds: answerRecord.questionIds,
        answeredQuestionIds:answeredQuestionIds,
        skipped: previousAnswer ? previousAnswer.skipped : false,
        previousAnswer: previousAnswer ? previousAnswer.answerJson : null,
        skippedQuestions: skippedQuestionIds
    };
}

export async function submitQuizAnswer(userId: string, questionId: number, instanceId: number, answerJson: Prisma.InputJsonValue) {
    const answerRecord = await prisma.answer.findFirst({
        where: {userId, instanceId,},
        include: {questionsAnswers: true,},
    });
    if (!answerRecord) {
        throw new Error("ANSWER_RECORD_NOT_FOUND");
    }
    let questionAnswer = answerRecord.questionsAnswers.find(
        qa => qa.questionId === questionId
    );
    if (!questionAnswer) {
        throw new Error("ANSWER_QUESTIONS_RECORD_NOT_FOUND");
    }
    const updatedQA = await prisma.questionAnswer.update({
        where: {
            id: questionAnswer.id,
        },
        data: {
            answerJson,
            skipped: false,
            solvingTimeEnd: new Date()
        },
    });

    return updatedQA;
}

async function getNextUnansweredQuestion(answerRecord: { questionsAnswers: { id: number; createdAt: Date; answerId: number; questionId: number; answerJson: JsonValue | null; solvedTime: number | null; solvingTimeStart: Date; solvingTimeEnd: Date | null; skipped: boolean }[]; } & { id: number; surveyId: number; createdAt: Date; updatedAt: Date; instanceId: number; bookletId: number; userId: string; questionIds: number[]; }): Promise<QuizQuestion | null> {
    const answeredQuestionIds = new Set(
        answerRecord.questionsAnswers
            .filter(qa => qa.answerJson !== null || qa.skipped)
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
        contentHtml: question.contentHtml
    };
}

async function assignBookletToUser(surveyId: number) {
    return prisma.$transaction(async tx => {
        const booklets = await tx.booklet.findMany({
            where: { surveyId },
            include: {
                BookletQuestion: {
                    orderBy: { position: "asc" },
                    include: {
                        question: true,
                    },
                },
            },
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

export async function skipQuestion(userId: string, questionId: number, instanceId: number) {
    const answerRecord = await prisma.answer.findFirst({
        where: { userId, instanceId },
        include: { questionsAnswers: true },
    });
    if (!answerRecord) {
        throw new Error("ANSWER_RECORD_NOT_FOUND");
    }
    const qa = answerRecord.questionsAnswers.find(
        q => q.questionId === questionId
    );
    if (!qa) {
        throw new Error("ANSWER_QUESTIONS_RECORD_NOT_FOUND");
    }
    return prisma.questionAnswer.update({
        where: { id: qa.id },
        data: {
            skipped: true,
            answerJson: {},
            solvingTimeEnd: new Date()
        },
    });
}

export async function trackQuestionTime(userId: string, questionId: number, instanceId: number, seconds: number) {
    const answer = await prisma.answer.findFirst({
        where: {
            userId,
            instanceId,
            questionIds: {
                has: questionId
            }
        }
    })
    if (!answer) return
    await prisma.questionAnswer.update({
        where: {
            answerId_questionId: {
                answerId: answer.id,
                questionId
            }
        },
        data: {
            solvedTime: {
                increment: seconds
            }}
    })
}