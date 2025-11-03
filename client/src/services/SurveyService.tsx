export interface CreateSurveyDTO {
    title: string;
    description?: string;
    fromDate?: string;
    toDate?: string;
    mode: "adaptiv" | "design";
}

export interface SurveyResponse {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    mode: string;
}
// @ts-expect-error
const API_BASE = import.meta.env.VITE_API_URL;

export async function createSurvey(data: CreateSurveyDTO): Promise<SurveyResponse> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/survey`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`Failed to create survey: ${message}`);
    }

    return res.json();
}

export async function getSurveys(): Promise<SurveyResponse[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/survey`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`Failed to fetch surveys: ${message}`);
    }

    return res.json();
}
