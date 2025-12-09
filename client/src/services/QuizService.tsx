// @ts-expect-error
const API_BASE = import.meta.env.VITE_API_URL;

export interface QuizQuestion {
    id: number;
    text: string;
    options?: string[];
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
 * @returns Quiz object
 */
export async function getQuiz(id: string, userId: string): Promise<Quiz> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/quiz/${id}?userId=${userId}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
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
 * @returns Confirmation or saved answer
 */
export async function submitAnswer(quizId: string, answer: AnswerDTO, userId: string) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/quiz/${quizId}/answer?userId=${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(answer),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to submit answer: ${msg}`);
    }

    return res.json();
}
