const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7492/api";

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
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: "An unexpected error occurred." };
        }
        throw new Error(errorData.error || errorData.message || "Request failed");
    }

    return response.json();
}
