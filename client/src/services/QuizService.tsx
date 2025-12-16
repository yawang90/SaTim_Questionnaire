// @ts-expect-error
const API_BASE = import.meta.env.VITE_API_URL;

export interface QuizQuestion {
    id: number;
    text: string;
    options?: string[];
    contentJson: JSON;
    type: "text" | "single-choice" | "multi-choice";
}

export interface Quiz {
    id: string;
    title: string;
    questions: QuizQuestion[];
}

export interface AnswerDTO {
    questionId: number;
    answer: string | string[];
}

/**
 * Fetch a quiz by id
 * @param id Quiz ID
 * @param userId Cookie Session ID
 * @returns Quiz object
 */
export async function getQuiz(id: string, userId: string): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/api/quiz/${id}?userId=${userId}`, {
        headers: {
            "Content-Type": "application/json"},
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to fetch quiz: ${msg}`);
    }

    return res.json();
}

/**
 * Submit an answer for a quiz question
 * @param quizId Quiz ID
 * @param answer Answer object
 * @param userId Cookie Session ID
 * @returns Confirmation or saved answer
 */
export async function submitAnswer(quizId: string, answer: AnswerDTO, userId: string) {
    const res = await fetch(`${API_BASE}/api/quiz/${quizId}/answer?userId=${userId}`, {
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
