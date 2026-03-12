import prisma from "../config/prismaClient.js";
import type {answer, Prisma, questionAnswer} from "@prisma/client";

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
    questionAnswerId: number;
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

export async function getQuiz(instanceId: string, userId: string, questionAnswerId?: number, freeParam?: string): Promise<NextQuestion> {
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
        include: { questionsAnswers: true, booklet: { include: { bookletQuestion: { orderBy: { position: "asc" } } } } },
    });
    // user enters the first time
    if (!answerRecord) {
        const booklet = await assignBookletToUser(survey.id);
        let questionIds = booklet.bookletQuestion.map(bq => bq.question.id);
        const twoTier = instance.twoTierQuestion;
        if (instance.isTwoTier && twoTier != null) {
            questionIds = questionIds.flatMap(qid => [qid, twoTier]);
        }
        answerRecord = await prisma.answer.create({
            data: {
                surveyId: survey.id,
                instanceId: instance.id,
                bookletId: booklet.id,
                userId,
                freeParam: freeParam ? freeParam: null,
                questionIds: questionIds,
            },
            include: { questionsAnswers: true, booklet: { include: { bookletQuestion: true } } },
        });
        if (!answerRecord) throw new Error("Answer record could not be created");
        const questionAnswerData = questionIds.map((qid, index, arr) => ({
            answerId: answerRecord!.id,
            questionId: qid,
            twoTierQuestionRef: instance.isTwoTier && index % 2 === 1 ? arr[index - 1] : null,
        }));

        await prisma.questionAnswer.createMany({
            data: questionAnswerData,
            skipDuplicates: true,
        });

    }
    let nextQuestion: QuizQuestion | null = null;
    let nextQuestionAnswer: questionAnswer | null;
    if (questionAnswerId !== undefined) {
        nextQuestionAnswer = await prisma.questionAnswer.findUnique({ where: { id: questionAnswerId } });
    } else {
        nextQuestionAnswer = await getNextUnansweredQuestion(answerRecord);
    }
    if (nextQuestionAnswer) {
        nextQuestion = await prisma.question.findUnique({ where: { id: nextQuestionAnswer.questionId } });
    }

    const answeredQuestionIds = answerRecord.questionsAnswers.filter(qa => qa.answerJson !== null).map(qa => qa.questionId);
    const skippedQuestionIds = answerRecord.questionsAnswers.filter(qa => qa.skipped === true).map(qa => qa.questionId);
    const totalQuestions = answerRecord.questionIds.length;
    const answeredQuestions = answeredQuestionIds.length;
    if (nextQuestion && nextQuestionAnswer) {
        let cleanNextQuestion: QuizQuestion = {id: nextQuestion.id, contentJson: nextQuestion.contentJson, contentHtml: nextQuestion.contentHtml ? nextQuestion.contentHtml : null, correctAnswers: nextQuestion.correctAnswers};
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
            questionAnswerId: nextQuestionAnswer.id,
            answeredQuestionIds:answeredQuestionIds,
            skipped: nextQuestionAnswer.skipped,
            previousAnswer: nextQuestionAnswer.answerJson,
            skippedQuestions: skippedQuestionIds
        };
    } else {
        throw new Error("Error at fetching Question and creating Question answer.");
    }
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

async function getNextUnansweredQuestion(answerRecord: answer): Promise<questionAnswer | null> {
 return null;
}

async function assignBookletToUser(surveyId: number) {
    return prisma.$transaction(async tx => {
        const booklets = await tx.booklet.findMany({
            where: { surveyId },
            include: {
                bookletQuestion: {
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

export async function startQuestionSession(userId: string, questionId: number, instanceId: number) {
    const answer = await prisma.answer.findFirst({
        where: { userId, instanceId }
    });
    if (!answer) return;
    const qa = await prisma.questionAnswer.findUnique({
        where: {
            answerId_questionId: {
                answerId: answer.id,
                questionId
            }
        }
    });
    if (!qa) return;
    const openSession = await prisma.questionSolvingSession.findFirst({
        where: {
            questionAnswerId: qa.id,
            endTime: null
        }
    });
    if (!openSession) {
        await prisma.questionSolvingSession.create({
            data: {
                questionAnswerId: qa.id,
                startTime: new Date()
            }
        });
    } else {
        await prisma.questionSolvingSession.update({
            where: { id: openSession.id },
            data: { endTime: new Date() }
        });
    }
}

export async function endQuestionSession(userId: string, questionId: number, instanceId: number) {
    const answer = await prisma.answer.findFirst({
        where: { userId, instanceId }
    });
    if (!answer) return;
    const qa = await prisma.questionAnswer.findUnique({
        where: {
            answerId_questionId: {
                answerId: answer.id,
                questionId
            }
        }
    });
    if (!qa) return;
    const openSession = await prisma.questionSolvingSession.findFirst({
        where: {
            questionAnswerId: qa.id,
            endTime: null
        }
    });
    if (!openSession) return;
    const now = new Date();
    await prisma.questionSolvingSession.update({
        where: { id: openSession.id },
        data: { endTime: now }
    });
    const duration =
        (now.getTime() - openSession.startTime.getTime()) / 1000;
    await prisma.questionAnswer.update({
        where: { id: qa.id },
        data: {
            solvedTime: { increment: duration }
        }
    });
}