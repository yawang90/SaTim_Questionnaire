import prisma from "../config/prismaClient.js";
import type {Prisma} from "@prisma/client";

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
    isTwoTier: boolean;
    feedback?: Record<string, string> | null;
    solved: boolean;
}

export async function getQuiz(instanceId: string, userId: string, questionId?: number, nextQuestionId?: number, freeParam?: string): Promise<NextQuestion> {
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
        include: { questionsAnswers: {include: {feedbackAnswer: true},}, booklet: { include: { bookletQuestion: { orderBy: { position: "asc" } } } } },
    });
    if (!answerRecord) {
        const booklet = await assignBookletToUser(survey.id);
        answerRecord = await prisma.answer.create({
            data: {
                surveyId: survey.id,
                instanceId: instance.id,
                bookletId: booklet.id,
                userId,
                freeParam: freeParam ? freeParam: null,
                questionIds: booklet.bookletQuestion.map(bq => bq.question.id),
            },
            include: { questionsAnswers: {include: {feedbackAnswer: true},}, booklet: { include: { bookletQuestion: true } } },
        });
        for (const questionId of answerRecord.questionIds) {
            await prisma.questionAnswer.create({
                data: {
                    answerId: answerRecord.id,
                    questionId: questionId,
                },
            });
        }
    }
    let nextQuestion: QuizQuestion | null = null;
    if (questionId !== undefined) {
        nextQuestion = await prisma.question.findUnique({ where: { id: questionId } });
    } else {
        if (nextQuestionId !== undefined) {
            const i = answerRecord.questionIds.indexOf(nextQuestionId);
            const nextId = answerRecord.questionIds[i + 1];
            if (nextId) {
                nextQuestion = await prisma.question.findUnique({where: { id: nextId},});
            }
        } else {
            const firstId = answerRecord.questionIds[0];
            if (firstId) {
                nextQuestion = await prisma.question.findUnique({where: { id: firstId},});
            }
        }
    }
    let previousFeedback;
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
        if (previousAnswer?.feedbackAnswer) {
            previousFeedback = Object.fromEntries(
                previousAnswer.feedbackAnswer.map(f => [
                    f.questionKey,
                    f.selectedOption,
                ])
            );
        }
        previousAnswer = qaRecord;
    }
    const answeredQuestionIds = answerRecord.questionsAnswers
        .filter(qa => qa.solved || qa.skipped)
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
        solved: previousAnswer ? previousAnswer.solved : false,
        previousAnswer: previousAnswer ? previousAnswer.answerJson : null,
        skippedQuestions: skippedQuestionIds,
        isTwoTier: survey.isTwoTier,
        feedback: previousFeedback? previousFeedback : null
    };
}

export async function submitQuizAnswer(userId: string, questionId: number, instanceId: number, answerJson: Prisma.InputJsonValue, isSolved: boolean) {
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
            skipped: isSolved ? false : questionAnswer.skipped,
            solved: isSolved,
            solvingTimeEnd: new Date()
        },
    });

    return updatedQA;
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
            solved: false,
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

export async function endQuizSession(userId: string, instanceId: number) {
    const answer = await prisma.answer.findFirst({
        where: { userId, instanceId }
    });
    if (!answer) return;
    await prisma.answer.update({
        where: { id: answer.id },
        data: {
            endedAt: new Date(),
        },
    });
}

export const saveFeedback = async ({instanceId, questionId, userId, feedback,}: { instanceId: number; questionId: number; userId: string; feedback: Record<string, string>; }) => {
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
    const operations = Object.entries(feedback).map(([key, value]) =>
        prisma.feedbackAnswer.upsert({
            where: {
                questionAnswerId_questionKey: {
                    questionAnswerId: questionAnswer.id,
                    questionKey: key,
                },
            },
            update: {
                selectedOption: value,
            },
            create: {
                questionAnswerId: questionAnswer.id,
                questionKey: key,
                selectedOption: value,
            },
        })
    );

    await prisma.$transaction(operations);

    return { success: true };
};