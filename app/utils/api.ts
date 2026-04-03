import { redirect } from "react-router";

let cachedUser: { user: any; timestamp: number } | null = null;
const CACHE_TTL = 60000;

export function getCachedUser(): { user: any; timestamp: number } | null {
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
        return cachedUser;
    }
    return null;
}

export function setCachedUser(user: any): void {
    cachedUser = { user, timestamp: Date.now() };
}

export function clearCachedUser(): void {
    cachedUser = null;
}

export const API_BASE = import.meta.env.VITE_API_URL ||"http://localhost:7492/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const defaultOptions: RequestInit = {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        signal: controller.signal,
    };

    try {
        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
                clearCachedUser();
                throw redirect("/login");
            }

            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." };
            }
            
            class ApiError extends Error {
                status: number;
                constructor(message: string, status: number) {
                    super(message);
                    this.name = "ApiError";
                    this.status = status;
                }
            }
            
            throw new ApiError(errorData.error || errorData.message || "فشل الطلب", response.status);
        }

        const data = await response.json();
        
        if (endpoint === "/auth/me" && data.user) {
            setCachedUser(data.user);
        }
        
        return data;
    } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === "AbortError") {
            class ApiError extends Error {
                status: number;
                constructor() {
                    super("انتهت مهلة الطلب. يرجى التحقق من اتصالك بالإنترنت.");
                    this.name = "ApiError";
                    this.status = 408;
                }
            }
            throw new ApiError();
        }
        
        if (error.status === 401 || error instanceof Response) {
            clearCachedUser();
        }
        
        throw error;
    }
}
