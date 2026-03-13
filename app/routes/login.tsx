import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../utils/api";

export function meta() {
    return [{ title: "تسجيل الدخول | Quizaty" }];
}

export default function LoginPage() {
    const [role, setRole] = useState<"student" | "teacher">("student");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            navigate(
                data.user.role === "teacher"
                    ? "/teacher/dashboard"
                    : "/student/dashboard",
            );
        } catch (err: any) {
            setError(err.message || "فشل تسجيل الدخول. حاول مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    const activeBtn =
        "w-1/2 py-2.5 text-sm font-black rounded-xl bg-white shadow-sm text-indigo-600 transition-all duration-200";
    const inactiveBtn =
        "w-1/2 py-2.5 text-sm font-bold rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-200";

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="max-w-md mx-auto w-full bg-white rounded-4xl shadow-xl border border-slate-100 p-10 relative overflow-hidden">
                {/* Accent Line */}
                <div className="absolute top-0 right-0 w-full h-1.5 bg-indigo-500" />

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <svg
                            className="w-8 h-8 text-indigo-600 -rotate-3"
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
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 px-5 py-4 rounded-xl mb-8 flex items-start text-right">
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
                <div className="flex justify-center mb-8 bg-slate-100 p-1 rounded-2xl">
                    <button
                        type="button"
                        className={`${role === "student" ? activeBtn : inactiveBtn} cursor-pointer`}
                        onClick={() => setRole("student")}
                    >
                        طالب
                    </button>
                    <button
                        type="button"
                        className={`${role === "teacher" ? activeBtn : inactiveBtn} cursor-pointer`}
                        onClick={() => setRole("teacher")}
                    >
                        معلم
                    </button>
                </div>

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
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right"
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
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right"
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
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/30 outline-none flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 cursor-pointer"
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
                            className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline underline-offset-4 mr-1"
                        >
                            أنشئ حساباً جديداً
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
