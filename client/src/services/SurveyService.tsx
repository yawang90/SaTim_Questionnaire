export interface CreateSurveyDTO {
    title: string;
    description?: string;
    fromDate?: string;
    toDate?: string;
    mode: "adaptiv" | "design";
    status?: "ACTIVE" | "IN_PROGRESS" | "FINISHED";
}

export interface SurveyResponse {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    status?: "ACTIVE" | "IN_PROGRESS" | "FINISHED";
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

export async function updateSurveyFiles(id: string, file1: File, file2: File) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);

    const res = await fetch(`${API_BASE}/api/survey/${id}/files`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });

    if (!res.ok) throw new Error("Failed to upload files");
    return res.json();
}

export interface UserRef {
    id: number;
    first_name: string;
    last_name: string;
}

export async function getSurveyById(id: string): Promise<SurveyResponse & { createdBy: UserRef; updatedBy: UserRef }> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/survey/${id}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`Failed to fetch survey by id: ${message}`);
    }

    return res.json();
}

export async function updateSurvey(id: string, data: {
    title?: string;
    description?: string;
    status?: "ACTIVE" | "IN_PROGRESS" | "FINISHED";
}) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`${API_BASE}/api/survey/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update survey (status ${response.status})`);
    }

    return await response.json();
}


export const uploadSurveyExcels = async (surveyId: string, file1: File, file2: File) => {
    const formData = new FormData();
    formData.append("slotQuestionFile", file1);
    formData.append("bookletSlotFile", file2);
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`${API_BASE}/api/survey/${surveyId}/upload-excels`, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
};

export interface Booklet {
    id: number;
    bookletId: number;
    questions: any[];
    excelFileUrl: string;
    createdAt: string;
}

export async function getSurveyBooklets(surveyId: string): Promise<Booklet[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/survey/${surveyId}/booklets`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`Failed to fetch booklets: ${message}`);
    }

    return res.json();
}

export interface SurveyInstanceDTO {
    name: string;
    validFrom: string;
    validTo: string;
}

export async function createSurveyInstance(surveyId: number, data: SurveyInstanceDTO) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/survey/${surveyId}/instance`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`Failed to create survey instance: ${message}`);
    }

    return res.json();
}

export async function getSurveyInstances(surveyId: string) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_BASE}/api/survey/${surveyId}/instances`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(`Failed to fetch survey instances: ${message}`);
    }

    return res.json();
}
