// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;
import {studentAuthFetch} from "./StudentAuthFetchHelper.tsx";

export interface Student {
    id: number;
    email?: string;
    birthday: string;
}

export interface RegisterStudentRequest {
    email: string;
    password: string;
    birthday: string;
    registrationToken: string;
}

export interface StudentLoginRequest {
    email: string;
    password: string;
}

export interface StudentLoginResponse {
    token: string;
    studentId: number;
}

export interface StudentTest {
    id: number;
    instanceId: number;
    title: string;
    description?: string;
    validFrom: string;
    validTo: string;
    status: "OPEN" | "FINISHED";
}

export const registerStudent = async (data: RegisterStudentRequest) => {
    const response = await fetch(
        `${API_URL}/api/student/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message || "Registration failed"
        );
    }

    const result = await response.json();
    console.log(result);
    saveStudentSession(result);
    return result;
};


export const loginStudent = async (
    data: StudentLoginRequest
): Promise<StudentLoginResponse> => {

    const response = await fetch(
        `${API_URL}/api/student/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            error.message || "Login failed"
        );
    }
    const result = await response.json();
    saveStudentSession(result);
    return result;
};

const saveStudentSession = (result: StudentLoginResponse) => {
    localStorage.setItem(
        "studentToken",
        result.token
    );
    localStorage.setItem(
        "studentId",
        result.studentId.toString()
    );
};

export const getAssignedTests = async (): Promise<StudentTest[]> => {
    const response = await studentAuthFetch(`${API_URL}/api/student/tests`);

    if (!response.ok) {
        throw new Error("Failed to fetch assigned tests");
    }

    return response.json();
};

export const logoutStudent = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentId");
};

export const getStudentById = async (id: number): Promise<Student> => {

    const response = await studentAuthFetch(
        `${API_URL}/api/student/profile/${id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message || "Failed to fetch student"
        );
    }

    return response.json();
};