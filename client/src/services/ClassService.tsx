import { authFetch } from "./AuthFetchHelper.tsx";
// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export enum SchoolClassType {
    KANTI_KURZ_1 = "KANTI_KURZ_1",
    KANTI_KURZ_2 = "KANTI_KURZ_2",
    KANTI_LANG_1 = "KANTI_LANG_1",
    SEK_7 = "SEK_7",
    SEK_8 = "SEK_8",
    SEK_9 = "SEK_9",
}

export interface SchoolClass {
    id: number;
    name: string;
    type: SchoolClassType;
    teacherId: number;
    createdAt: string;
    studentCount: number;
}

export interface CreateSchoolClassRequest {
    name: string;
    type: SchoolClassType;
}

export interface UpdateSchoolClassRequest {
    name: string;
    type: SchoolClassType;
}

export const getClasses = async (): Promise<SchoolClass[]> => {
    const token = localStorage.getItem("token");

    const response = await authFetch(`${API_URL}/api/class/list`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch classes");
    }

    return response.json();
};

export const createClass = async (
    data: CreateSchoolClassRequest
) => {
    const token = localStorage.getItem("token");

    const response = await authFetch(`${API_URL}/api/class`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create class");
    }

    return response.json();
};

export const updateClass = async (
    classId: number,
    data: UpdateSchoolClassRequest
) => {
    const token = localStorage.getItem("token");

    const response = await authFetch(`${API_URL}/api/class/${classId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update class");
    }

    return response.json();
};

export const deleteClass = async (classId: number) => {
    const token = localStorage.getItem("token");

    const response = await authFetch(`${API_URL}/api/class/${classId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete class");
    }

    return response.json();
};