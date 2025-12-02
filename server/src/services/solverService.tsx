import prisma from "../config/prismaClient.js";
import type { question } from "@prisma/client";
import { convertLatexToAsciiMath  } from "mathlive";
import nerdamer from "nerdamer";

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
    value: any;
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
    value: any;
}

export interface EvaluateDetail {
    key: string;
    given: any;
    expected: any;
    correct: boolean;
}

export interface EvaluateResult {
    score: number;
    total: number;
    details: EvaluateDetail[];
}

export const evaluateAnswersService = async (
    questionId: number,
    userAnswers: UserAnswerInput[]
): Promise<EvaluateResult> => {
    const questionEntry: Pick<question, "id" | "correctAnswers"> | null =
        await prisma.question.findUnique({
            where: { id: questionId },
            select: { id: true, correctAnswers: true }
        });

    if (!questionEntry) throw new Error("Question not found");

    const correctAnswers = questionEntry.correctAnswers as CorrectAnswersJson | null;

    if (!correctAnswers || typeof correctAnswers !== "object") {
        throw new Error("No correct answers found for this question");
    }

    let score = 0;
    const total = Object.keys(correctAnswers).length;
    const details: EvaluateDetail[] = [];

    for (const key of Object.keys(correctAnswers)) {
        const correctAnswer = correctAnswers[key];
        const userAnswer = userAnswers.find(a => a.key === key);

        let isCorrect = false;

        if (userAnswer && correctAnswer) {
            switch (correctAnswer.type) {
                case "sc": {
                    const selected =
                        (userAnswer.value as { id: string; selected: boolean }[])
                            .find(a => a.selected)?.id;

                    if (selected === correctAnswer.value) {
                        isCorrect = true;
                        score += 1;
                    }
                    break;
                }

                case "mc": {
                    const selectedIds = (userAnswer.value as { id: string; selected: boolean }[])
                        .filter(a => a.selected)
                        .map(a => a.id);

                    const correctSet = new Set(correctAnswer.value);
                    const userSet = new Set(selectedIds);

                    const sameSize = correctSet.size === userSet.size;
                    const sameElements = [...correctSet].every(id => userSet.has(id));

                    if (sameSize && sameElements) {
                        isCorrect = true;
                        score += 1;
                    }
                    break;
                }

                case "numeric": {
                    const conditions = Array.isArray(correctAnswer.value)
                        ? correctAnswer.value
                        : [{ value: String(correctAnswer.value), operator: correctAnswer.operator || "=", logic: "and" }];
                    const userVal = Number(userAnswer.value);

                    let result = conditions[0]?.logic === "and";
                    for (const condition of conditions) {
                        const condValue = Number(condition.value);
                        let check = false;
                        const EPS = 1e-12;
                        switch (condition.operator) {
                            case "=":
                                check = Math.abs(userVal - condValue) < EPS;
                                break;
                            case "<":
                                check = userVal < condValue - EPS;
                                break;
                            case ">":
                                check = userVal > condValue + EPS;
                                break;
                            case "<=":
                                check = userVal <= condValue + EPS;
                                break;
                            case ">=":
                                check = userVal >= condValue - EPS;
                                break;
                        }

                        if (condition.logic === "and") result = result && check;
                        else result = result || check;
                    }

                    if (result) {
                        isCorrect = true;
                        score += 1;
                    }

                    break;
                }

                case "algebra": {
                    const conditions = correctAnswer.value as {
                        logic: "and" | "or";
                        value: string;
                        operator: "<" | ">" | "<=" | ">=" | "=";
                    }[];

                    const givenLatex = String(userAnswer.value);

                    try {
                        const givenAscii = convertLatexToAsciiMath(givenLatex);
                        const givenExpr = nerdamer(givenAscii).expand();
                        let result = (conditions[0]?.logic === "and");

                        for (const condition of conditions) {
                            const expectedAscii = convertLatexToAsciiMath(condition.value);
                            const expectedExpr = nerdamer(expectedAscii).expand();
                            const diff = nerdamer(`(${givenExpr}) - (${expectedExpr})`).expand();

                            let check = false;
                            const test = (cmd: string) => {
                                const res = nerdamer(cmd).text();
                                if (res === "true") return true;
                                return res !== "false";

                            };
                            switch (condition.operator) {
                                case "=":
                                    check = test(`isZero(${diff})`);
                                    break;
                                case "<":
                                    check = test(`isNegative(${diff})`);
                                    break;
                                case ">":
                                    check = test(`isPositive(${diff})`);
                                    break;
                                case "<=":
                                    check = test(`isNegative(${diff})`) || test(`isZero(${diff})`);
                                    break;
                                case ">=":
                                    check = test(`isPositive(${diff})`) || test(`isZero(${diff})`);
                                    break;
                            }
                            if (condition.logic === "and") result = result && check;
                            else result = result || check;
                        }
                        if (result) {
                            isCorrect = true;
                            score += 1;
                        }
                    } catch (err) {
                        console.error("Algebra evaluation failed:", err);
                    }
                    break;
                }
                case "freeText":
                case "freeTextInline":
                    if (
                        correctAnswer.value.trim().toLowerCase() ===
                        String(userAnswer.value).trim().toLowerCase()
                    ) {
                        isCorrect = true;
                        score += 1;
                    }
                    break;

                case "geoGebra":
                    if (
                        JSON.stringify(correctAnswer.value) ===
                        JSON.stringify(userAnswer.value)
                    ) {
                        isCorrect = true;
                        score += 1;
                    }
                    break;
            }
        }
        details.push({
            key,
            given: userAnswer?.value ?? null,
            expected: correctAnswer?.value,
            correct: isCorrect
        });
    }
    return {
        score,
        total,
        details
    };
};
