import { teacherAuthFetch } from "./TeacherAuthFetchHelper.tsx";

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;


export interface TeacherTest {
    id: number;
    title: string;
    description?: string;
    status: string;
    mode: string;
    createdAt: string;

    assignedClasses?: {
        id: number;
        name: string;
    }[];

    activeInstances?: number;
}


export interface ActivateTestRequest {
    surveyId: number;
    classId: number;
}


export interface TestFilter {
    search?: string;
    status?: string;
    mode?: string;
}


export const getTeacherTests = async (teacherId: number, filters?: TestFilter): Promise<TeacherTest[]> => {
    const params = new URLSearchParams();
    if (filters?.search) {
        params.append("search", filters.search);
    }

    if (filters?.status) {
        params.append("status", filters.status);
    }

    if (filters?.mode) {
        params.append("mode", filters.mode);
    }
    const response = await teacherAuthFetch(
        `${API_URL}/api/teacher/${teacherId}/tests?${params.toString()}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
            },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch teacher tests");
    }
    return response.json();
};


export const activateTestId = async (data: ActivateTestRequest) => {
    const response = await teacherAuthFetch(
        `${API_URL}/api/teacher/tests/activate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
            },
            body: JSON.stringify(data),
        }
    );
    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message || "Failed to activate test"
        );
    }
    return response.json();
};


export const getClassTests = async (
    classId: number
): Promise<TeacherTest[]> => {

    const response = await teacherAuthFetch(
        `${API_URL}/api/teacher/class/${classId}/tests`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error("Failed to fetch class tests");
    }
    return response.json();
};


export const deactivateTest = async (
    instanceId: number
) => {
    const response = await teacherAuthFetch(
        `${API_URL}/api/teacher/tests/${instanceId}/deactivate`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
            },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to deactivate test");
    }
    return response.json();
};