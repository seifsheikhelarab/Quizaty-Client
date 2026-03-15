import { redirect } from "react-router";

export const API_BASE = process.env.VITE_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;

    const defaultOptions: RequestInit = {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
    };

    const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401 && !endpoint.includes("/auth/login")) {
            throw redirect("/login");
        }

        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: "An unexpected error occurred." };
        }
        
        class ApiError extends Error {
            status: number;
            constructor(message: string, status: number) {
                super(message);
                this.name = "ApiError";
                this.status = status;
            }
        }
        
        throw new ApiError(errorData.error || errorData.message || "Request failed", response.status);
    }

    return response.json();
}
