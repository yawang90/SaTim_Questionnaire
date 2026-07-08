import { teacherAuthFetch } from "./TeacherAuthFetchHelper.tsx";
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
    registrationToken: string;
}

export interface Student {
    id: number;
    first_name: string;
    last_name: string;
    birthday: string;
    email?: string;
}

export interface CreateSchoolClassRequest {
    name: string;
    type: SchoolClassType;
}

export interface UpdateSchoolClassRequest {
    name: string;
    type: SchoolClassType;
}

const getToken = () => localStorage.getItem("teacherToken");

export const getClasses = async (): Promise<SchoolClass[]> => {
    const response = await teacherAuthFetch(`${API_URL}/api/schoolclass/list`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch classes");
    }

    return response.json();
};

export const getClass = async (
    classId: number
): Promise<SchoolClass> => {
    const response = await teacherAuthFetch(
        `${API_URL}/api/schoolclass/${classId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch class");
    }

    return response.json();
};

export const getStudents = async (
    classId: number
): Promise<Student[]> => {
    const response = await teacherAuthFetch(
        `${API_URL}/api/schoolclass/${classId}/students`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch students");
    }

    return response.json();
};

export const createClass = async (
    data: CreateSchoolClassRequest
) => {
    const response = await teacherAuthFetch(`${API_URL}/api/schoolclass`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
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
    const response = await teacherAuthFetch(
        `${API_URL}/api/schoolclass/${classId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update class");
    }

    return response.json();
};

export const deleteClass = async (classId: number) => {
    const response = await teacherAuthFetch(
        `${API_URL}/api/schoolclass/${classId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete class");
    }

    return response.json();
};