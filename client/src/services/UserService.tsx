// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export interface RegisterFormData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    token: string;
    userId: string;
    message?: string;
}

export interface User {
    id: string;
    token: string;
}

export const registerUser = async (formData: RegisterFormData): Promise<User> => {
    const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    return data;
};

export const getUserById = async (userId: string): Promise<User> => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/users/get?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return await res.json();
};

export const findUsersByNameOrEmail = async (nameOrEmail: string, projectId: string): Promise<User[]> => {
    const token = localStorage.getItem("token");
    const res = await fetch(
        `${API_URL}/api/users/search?query=${encodeURIComponent(nameOrEmail)}&projectId=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
};
