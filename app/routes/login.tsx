import { useState } from "react";
import { Link, useNavigate, redirect } from "react-router";
import { apiFetch } from "../utils/api";

export function meta() {
    return [{ title: "تسجيل الدخول | Quizaty" }];
}

export async function clientLoader() {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7492/api";
    
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.user.role === "teacher" || data.user.isAssistant) {
                throw redirect("/teacher/dashboard");
            } else if (data.user.role === "student") {
                throw redirect("/student/dashboard");
            }
        }
    } catch (e) {
        if (e instanceof Response) throw e;
        // Not logged in, stay on login
    }
    return null;
}

export default function LoginPage() {
    const [role, setRole] = useState<"student" | "teacher">("student");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const roleHintId = "login-role-hint";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const body: Record<string, string> = { role };

        if (role === "teacher") {
            body.email = formData.get("email") as string;
        } else {
            body.phone = formData.get("phone") as string;
        }
        body.password = formData.get("password") as string;

        try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (data.user.role === "student") {
        const inviteClassId = sessionStorage.getItem("inviteClassId");
        if (inviteClassId) {
          try {
            await apiFetch(`/classes/${inviteClassId}/join`, { method: "POST" });
            sessionStorage.removeItem("inviteClassId");
            navigate("/student/classes");
            return;
          } catch (joinErr) {
            console.error("Failed to join class after login", joinErr);
          }
        }
        navigate("/student/dashboard");
      } else {
        navigate("/teacher/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول. حاول مرة أخرى.");
    } finally {
            setLoading(false);
        }
    };

    const activeBtn =
        "w-1/2 py-2.5 text-sm font-black rounded-xl bg-white shadow-sm text-primary-700 transition-all duration-200";
    const inactiveBtn =
        "w-1/2 py-2.5 text-sm font-bold rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-200";

    return (
        <div className="min-h-screen overflow-hidden relative flex items-center justify-center p-6 text-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-primary-100)_80%,transparent),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-secondary-100)_85%,transparent),transparent_35%)]" />

            <div className="max-w-md mx-auto w-full rounded-4xl border border-white/75 bg-white/92 p-10 relative overflow-hidden shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--color-primary-700)_40%,transparent)] backdrop-blur opacity-0 animate-reveal-up">
                {/* Accent Line */}
                <div className="absolute top-0 right-0 h-1.5 w-full bg-linear-to-l from-secondary-500 via-primary-500 to-primary-600" />

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
                        <svg
                            className="w-8 h-8 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        تسجيل الدخول
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        مرحباً بك! يرجى اختيار دورك والمتابعة.
                    </p>
                </div>

                {error && (
                    <div
                        className="bg-danger-50 border border-danger-200 text-danger-700 px-5 py-4 rounded-xl mb-8 flex items-start text-right"
                        role="alert"
                        aria-live="polite"
                    >
                        <svg
                            className="w-5 h-5 ml-3 mt-0.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-sm">{error}</span>
                    </div>
                )}

                {/* Role Selector */}
                <fieldset className="mb-8">
                    <legend className="mb-2 text-sm font-bold text-slate-700">
                        اختر نوع الحساب
                    </legend>
                    <p id={roleHintId} className="mb-3 text-sm text-slate-500">
                        اختر ما إذا كنت ستسجل الدخول كطالب أو معلم.
                    </p>
                    <div
                        className="flex justify-center rounded-2xl border border-primary-100/70 bg-primary-50/60 p-1"
                        role="radiogroup"
                        aria-describedby={roleHintId}
                    >
                        <button
                            type="button"
                            role="radio"
                            aria-checked={role === "student"}
                            aria-label="تسجيل الدخول كطالب"
                            className={`${role === "student" ? activeBtn : inactiveBtn} cursor-pointer`}
                            onClick={() => setRole("student")}
                        >
                            طالب
                        </button>
                        <button
                            type="button"
                            role="radio"
                            aria-checked={role === "teacher"}
                            aria-label="تسجيل الدخول كمعلم"
                            className={`${role === "teacher" ? activeBtn : inactiveBtn} cursor-pointer`}
                            onClick={() => setRole("teacher")}
                        >
                            معلم
                        </button>
                    </div>
                </fieldset>

                <form onSubmit={handleSubmit} className="space-y-6 text-right">
                    {role === "student" && (
                        <div>
                            <label
                                className="block text-sm font-bold text-slate-700 mb-2"
                                htmlFor="phone"
                            >
                                رقم الهاتف
                            </label>
                            <input
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right"
                                id="phone"
                                type="tel"
                                name="phone"
                                placeholder="01xxxxxxxxx"
                                required
                            />
                        </div>
                    )}

                    {role === "teacher" && (
                        <div>
                            <label
                                className="block text-sm font-bold text-slate-700 mb-2"
                                htmlFor="email"
                            >
                                البريد الإلكتروني
                            </label>
                            <input
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="example@mail.com"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label
                            className="block text-sm font-bold text-slate-700 mb-2"
                            htmlFor="password"
                        >
                            كلمة المرور
                        </label>
                        <input
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right"
                                id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        className="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/50 transition-all shadow-lg hover:shadow-primary-500/30 outline-none flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 cursor-pointer"
                        type="submit"
                        disabled={loading}
                    >
                        <span>
                            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                        </span>
                        {!loading && (
                            <svg
                                className="w-5 h-5 rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        ليس لديك حساب؟
                        <Link
                            to="/register"
                            className="text-primary-600 hover:text-primary-700 font-bold hover:underline underline-offset-4 mr-1"
                        >
                            أنشئ حساباً جديداً
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
