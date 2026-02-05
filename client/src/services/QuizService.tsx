import type {GeoGebraLine, GeoGebraPoint} from "../pages/questions/AnswerUtils.tsx";
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
 * @returns Quiz object
 */
export async function getQuiz(id: string, userId: string, questionId?: number): Promise<Quiz> {
    const url = new URL(`${API_BASE}/api/quiz/${id}`);
    url.searchParams.set("userId", userId);
    if (questionId) {
        url.searchParams.set("questionId", questionId.toString());
    }

    const res = await fetch(url.toString(), {
        headers: {
            "Content-Type": "application/json"
        },
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
    const res = await fetch(`${API_BASE}/api/quiz/${answer.questionId}/answer?userId=${userId}`, {
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
