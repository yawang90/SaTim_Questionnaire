import type {GeoGebraLine, GeoGebraPoint} from "../pages/utils/AnswerUtils.tsx";
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_URL;

export interface QuizQuestion {
    id: number;
    text: string;
    options?: string[];
    contentJson: JSON;
    type: "text" | "single-choice" | "multi-choice";
}

export interface Quiz {
    surveyId: number;
    surveyTitle: string;
    instanceId: number;
    bookletId: number;
    question: {
        id: number;
        contentJson?: any;
        contentHtml?: string | null;
        correctAnswers?: any;
    } | null;
    answerId: number;
    totalQuestions: number;
    answeredQuestions: number;
    questionIds: number[];
    answeredQuestionIds: number[];
    previousAnswer?: any;
    skipped: boolean;
    skippedQuestions: number[];
}

export interface LineEquationAnswer {
    value: string;
    m?: string;
    c?: string;
}

export type AnswerValue =
    | string[]
    | string
    | { id: string; selected: boolean }
    | { id: string; selected: boolean }[]
    | LineEquationAnswer
    | LineEquationAnswer[]
    | { points: GeoGebraPoint[]; lines: GeoGebraLine[] };

export interface AnswerDTO {
    questionId: number;
    instanceId: string;
    answer: AnswerValue[];
}

/**
 * Fetch a quiz by id
 * @param id Quiz ID
 * @param userId Cookie Session ID
 * @param questionId
 * @param freeParam
 * @returns Quiz object
 */
export async function getQuiz(id: string, userId: string, questionId?: number, freeParam?: string | null): Promise<Quiz> {
    const url = new URL(`${API_BASE}/api/quiz/instance/${id}`);
    const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId,
            freeParam: freeParam,
            questionId: questionId
        })
    });
    if (!res.ok) {
        if (res.status === 403) {
            throw new Error("NOT_ACTIVE");
        }
        const msg = await res.text();
        throw new Error(`Failed to fetch quiz: ${msg}`);
    }
    return res.json();
}
/**
 * Submit an answer for a quiz question
 * @param answer Answer object
 * @param userId Cookie Session ID
 * @returns Confirmation or saved answer
 */
export async function submitAnswer(answer: AnswerDTO, userId: string) {
    const res = await fetch(`${API_BASE}/api/quiz/question/${answer.questionId}/answer?userId=${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"},
        body: JSON.stringify(answer),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to submit answer: ${msg}`);
    }

    return res.json();
}

export async function skipQuestion(questionId: number, instanceId: string, userId: string) {
    const res = await fetch(`${API_BASE}/api/quiz/question/${questionId}/skip?instanceId=${instanceId}&userId=${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"},
        }
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to skip question");
    }
    return res.json();
}

export async function trackQuestionTime(instanceId: string, questionId: number, userId: string, seconds: number ) {
    const res = await fetch(
        `${API_BASE}/api/quiz/track-time`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                instanceId,
                questionId,
                userId,
                seconds
            })
        }
    )
    if (!res.ok) {
        const msg = await res.text()
        throw new Error(`Failed to track time: ${msg}`)
    }
    return res.json()
}