import prisma from "../config/prismaClient.js";
import type {question} from "@prisma/client";
import "nerdamer/Algebra.js";
import 'nerdamer/Solve.js';
import 'nerdamer/Calculus.js';
import 'nerdamer/Extra.js';

type AnswerType = "sc" | "mc" | "numeric" | "freeText" | "geoGebraPoints" | "geoGebraLines" | "freeTextInline" | "lineEquation";

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

interface FreeTextAnswer extends CorrectAnswerBase {
    type: "freeText" | "freeTextInline";
    value: string;
}

interface GeoGebraPointAnswer extends CorrectAnswerBase {
    type: "geoGebraPoints";
    value: any;
}

interface GeoGebraLineAnswer extends CorrectAnswerBase {
    type: "geoGebraLines";
    value: any;
}

interface LineEquationAnswer extends CorrectAnswerBase {
    type: "lineEquation";
    value: {
        m: NumericCondition[];
        c: NumericCondition[];
    };
}

type NumericCondition = {
    value: string;
    operator: "=" | "<" | ">" | "<=" | ">=";
    logic?: "and" | "or";
};

type CorrectAnswer =
    | SingleChoiceAnswer
    | MultipleChoiceAnswer
    | NumericAnswer
    | LineEquationAnswer
    | FreeTextAnswer
    | GeoGebraPointAnswer
    | GeoGebraLineAnswer;

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

                case "geoGebraPoints": {
                    const ok = checkGeoGebraPoints(correctAnswer.value, userAnswer.value);
                    if (ok) {
                        isCorrect = true;
                        score += 1;
                    }
                    break;
                }
                case "geoGebraLines": {
                    const ok = checkGeoGebraLines(correctAnswer.value, userAnswer.value);
                    if (ok) {
                        isCorrect = true;
                        score += 1;
                    }
                    break;
                }

                case "lineEquation": {
                        const ua = userAnswer as any;
                        const userM = Number(ua.parsed.m);
                        const userC = Number(ua.parsed.c);
                        if (!Number.isFinite(userM) || !Number.isFinite(userC)) break;
                        const { m, c } = correctAnswer.value;
                        const mOk = checkNumericConditions(userM, m);
                        const cOk = checkNumericConditions(userC, c);
                        if (mOk && cOk) {
                            isCorrect = true;
                            score += 1;
                        }
                        break;
                    }
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
function matchPoint(
    userPoint: { x:number; y:number },
    correctPoint: { x: NumericCondition[]; y: NumericCondition[] }
) {
    return (
        checkNumericConditions(userPoint.x, correctPoint.x) &&
        checkNumericConditions(userPoint.y, correctPoint.y)
    );
}
function checkGeoGebraPoints(correct: Record<string, any>, user: { name: string; x: number; y: number }[]): boolean {
    const userUnused = [...user];
    for (const correctPoint of Object.values(correct)) {
        const index = userUnused.findIndex(u =>
            matchPoint(u, correctPoint)
        );
        if (index === -1) return false;
        userUnused.splice(index, 1);
    }
    return true;
}


function matchLine(
    userLine: { m: number; c: number },
    correctLine: { m: NumericCondition[]; c: NumericCondition[] }
): boolean {
    const mOk = checkNumericConditions(userLine.m, correctLine.m);
    const cOk = checkNumericConditions(userLine.c, correctLine.c);
    return mOk && cOk;
}

function checkGeoGebraLines(correct: Record<string, any>, user: { m: number; c: number }[]): boolean {
    const userUnused = [...user];
    for (const correctLine of Object.values(correct)) {
        const index = userUnused.findIndex(u => matchLine(u, correctLine));
        if (index === -1) {return false;}
        userUnused.splice(index, 1);
    }
    return true;
}

function checkNumericConditions(value: number, conditions: { value: string; operator: "=" | "<" | ">" | "<=" | ">="; logic?: "and" | "or"; }[]
): boolean {
    const EPS = 1e-12;
    let result = conditions[0]?.logic !== "or";

    for (const cond of conditions) {
        const target = Number(cond.value);
        let check = false;

        switch (cond.operator) {
            case "=":
                check = Math.abs(value - target) < EPS;
                break;
            case "<":
                check = value < target - EPS;
                break;
            case ">":
                check = value > target + EPS;
                break;
            case "<=":
                check = value <= target + EPS;
                break;
            case ">=":
                check = value >= target - EPS;
                break;
        }
        if (cond.logic === "or") result = result || check;
        else result = result && check;
    }
    return result;
}
