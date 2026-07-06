import {authFetch} from "./AuthFetchHelper.tsx";
// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;
export interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    school_name: string;
    school_address: string;
}

export interface RegisterTeacherRequest {
    token?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    schoolName: string;
    schoolAddress: string;
}

export const getTeachers = async (): Promise<Teacher[]> => {
    const token = localStorage.getItem("token");

    const response = await authFetch(`${API_URL}/api/teacher/list`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch teachers");
    }

    return await response.json();
};


export const registerTeacher = async (data: RegisterTeacherRequest) => {
    const response = await fetch(
        `${API_URL}/api/teacher/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    return response.json();
};