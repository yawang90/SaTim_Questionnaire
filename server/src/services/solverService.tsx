import prisma from "../config/prismaClient.js";
import type { question } from "@prisma/client";

type AnswerType = "sc" | "mc" | "numeric" | "algebra" | "freeText" | "geoGebra" | "freeTextInline";

interface CorrectAnswerBase {
    type: AnswerType;
}

interface SingleChoiceAnswer extends CorrectAnswerBase {
    type: "sc";
    value: string;
}

interface MultipleChoiceAnswer extends CorrectAnswerBase {
    type: "mc";
    value: string[];
}

interface NumericAnswer extends CorrectAnswerBase {
    type: "numeric";
    value: number;
    operator?: "=" | "<" | ">" | "<=" | ">=";
}

interface AlgebraAnswer extends CorrectAnswerBase {
    type: "algebra";
    value: string;
}

interface FreeTextAnswer extends CorrectAnswerBase {
    type: "freeText" | "freeTextInline";
    value: string;
}

interface GeoGebraAnswer extends CorrectAnswerBase {
    type: "geoGebra";
    value: any;
}

type CorrectAnswer =
    | SingleChoiceAnswer
    | MultipleChoiceAnswer
    | NumericAnswer
    | AlgebraAnswer
    | FreeTextAnswer
    | GeoGebraAnswer;

type CorrectAnswersJson = Record<string, CorrectAnswer>;

export interface UserAnswerInput {
    key: string;
    value: any; // value submitted by user
}

export interface EvaluateResult {
    score: number;
    total: number;
    feedback?: string;
}

export const evaluateAnswersService = async (
    questionId: number,
    userAnswers: UserAnswerInput[]
): Promise<EvaluateResult> => {
    const questionEntry: Pick<question, "id" | "correctAnswers"> | null = await prisma.question.findUnique({
        where: { id: questionId },
        select: { id: true, correctAnswers: true },
    });

    if (!questionEntry) throw new Error("Question not found");

    const correctAnswers = questionEntry.correctAnswers as CorrectAnswersJson | null;

    if (!correctAnswers || typeof correctAnswers !== "object") {
        throw new Error("No correct answers found for this question");
    }

    let score = 0;
    const total = Object.keys(correctAnswers).length;

    for (const key of Object.keys(correctAnswers)) {
        const correctAnswer = correctAnswers[key];
        const userAnswer = userAnswers.find(a => a.key === key);
        if (!userAnswer) continue;
        if (!correctAnswer) throw "No correct answers found for this key: " + key;

        switch (correctAnswer.type) {
            case "sc": {
                const selected = (userAnswer.value as { id: string; selected: boolean }[]).find(a => a.selected)?.id;
                if (selected === (correctAnswer as SingleChoiceAnswer).value) score += 1;
                break;
            }

            case "mc": {
                const selectedIds = (userAnswer.value as { id: string; selected: boolean }[])
                    .filter(a => a.selected)
                    .map(a => a.id);

                const correctSet = new Set((correctAnswer as MultipleChoiceAnswer).value);
                const userSet = new Set(selectedIds);

                const isCorrect =
                    correctSet.size === userSet.size &&
                    [...correctSet].every(id => userSet.has(id));

                if (isCorrect) score += 1;
                break;
            }
            case "numeric":
            {
                const { value, operator = "=" } = correctAnswer as NumericAnswer;
                const userVal = Number(userAnswer.value);
                if (
                    (operator === "=" && userVal === value) ||
                    (operator === "<" && userVal < value) ||
                    (operator === ">" && userVal > value) ||
                    (operator === "<=" && userVal <= value) ||
                    (operator === ">=" && userVal >= value)
                ) {
                    score += 1;
                }
            }
                break;

            case "algebra":
                if ((correctAnswer as AlgebraAnswer).value === String(userAnswer.value)) score += 1;
                break;

            case "freeText":
            case "freeTextInline":
                if ((correctAnswer as FreeTextAnswer).value.trim().toLowerCase() === String(userAnswer.value).trim().toLowerCase()) {
                    score += 1;
                }
                break;

            case "geoGebra":
                if (JSON.stringify((correctAnswer as GeoGebraAnswer).value) === JSON.stringify(userAnswer.value)) score += 1;
                break;
        }
    }

    return { score, total };
};
