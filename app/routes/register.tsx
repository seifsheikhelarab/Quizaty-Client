import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../utils/api";

export function meta() {
  return [{ title: "إنشاء حساب جديد | Quizaty" }];
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7492/api";

export default function RegisterPage() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const roleHintId = "register-role-hint";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user.role === "teacher" || data.user.isAssistant) {
            navigate("/teacher/dashboard", { replace: true });
          } else if (data.user.role === "student") {
            navigate("/student/dashboard", { replace: true });
          }
        }
      } catch (e) {
        // Not logged in, stay on register
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const body: Record<string, string> = { role };
    const errors: Record<string, string> = {};

    const name = formData.get("name") as string;
    if (!name || name.trim().length < 2) {
      errors.name = "الاسم يجب أن يكون حرفين على الأقل";
    } else if (name.trim().length > 100) {
      errors.name = "الاسم طويل جداً";
    }
    body.name = name.trim();

    const phone = formData.get("phone") as string;
    if (!phone) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!/^01\d{9}$/.test(phone)) {
      errors.phone = "أدخل رقم هاتف صحيح (01xxxxxxxxx)";
    }
    body.phone = phone;

    const password = formData.get("password") as string;
    if (!password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (password.length < 6) {
      errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    body.password = password;

    if (role === "teacher") {
      const email = formData.get("email") as string;
      if (!email) {
        errors.email = "البريد الإلكتروني مطلوب";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "أدخل بريد إلكتروني صحيح";
      }
      body.email = email;
    } else {
      body.parentPhone = formData.get("parentPhone") as string || "";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/auth/register", {
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
            console.error("Failed to join class after registration", joinErr);
          }
        }
        navigate("/student/dashboard");
      } else {
        navigate("/teacher/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "فشل التسجيل. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const activeBtn = "w-1/2 py-2.5 text-sm font-black rounded-xl bg-white shadow-sm text-primary-700 transition-all duration-200";
  const inactiveBtn = "w-1/2 py-2.5 text-sm font-bold rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-200";

  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center p-6 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-primary-100)_80%,transparent),transparent_30%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-secondary-100)_85%,transparent),transparent_35%)]" />

      <div className="max-w-md mx-auto w-full rounded-4xl border border-white/75 bg-white/92 p-10 relative overflow-hidden shadow-2xl backdrop-blur opacity-0 animate-reveal-up">
        <div className="absolute top-0 right-0 h-1.5 w-full bg-primary-600" />

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">إنشاء حساب جديد</h1>
          <p className="text-slate-500 mt-2 font-medium">مرحباً بك! انضم إلينا اليوم وابدأ رحلتك.</p>
        </div>

        {error && (
          <div
            className="bg-danger-50 border border-danger-200 text-danger-700 px-5 py-4 rounded-xl mb-8 flex items-start text-right"
            role="alert"
            aria-live="polite"
          >
            <svg className="w-5 h-5 ml-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Role Selector */}
        <fieldset className="mb-8">
          <legend className="mb-2 text-sm font-bold text-slate-700">اختر نوع الحساب</legend>
          <p id={roleHintId} className="mb-3 text-sm text-slate-500">
            اختر ما إذا كنت تريد إنشاء حساب طالب أو معلم.
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
              aria-label="إنشاء حساب طالب"
              className={`${role === "student" ? activeBtn : inactiveBtn} cursor-pointer`}
              onClick={() => setRole("student")}
            >
              طالب
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={role === "teacher"}
              aria-label="إنشاء حساب معلم"
              className={`${role === "teacher" ? activeBtn : inactiveBtn} cursor-pointer`}
              onClick={() => setRole("teacher")}
            >
              معلم
            </button>
          </div>
        </fieldset>

        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="name">الاسم الكامل</label>
            <input 
              className={`w-full px-4 py-3.5 bg-slate-50 border text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right ${fieldErrors.name ? "border-danger-500 focus:ring-danger-500/20" : "border-slate-200"}`} 
              id="name" type="text" name="name" placeholder="أدخل اسمك الكامل" required 
            />
            {fieldErrors.name && <p className="mt-1.5 text-sm text-danger-600 font-medium">{fieldErrors.name}</p>}
          </div>

          {role === "teacher" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="email">البريد الإلكتروني</label>
              <input 
                className={`w-full px-4 py-3.5 bg-slate-50 border text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right ${fieldErrors.email ? "border-danger-500 focus:ring-danger-500/20" : "border-slate-200"}`} 
                id="email" type="email" name="email" placeholder="example@mail.com" required 
              />
              {fieldErrors.email && <p className="mt-1.5 text-sm text-danger-600 font-medium">{fieldErrors.email}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="phone">رقم الهاتف</label>
            <input 
              className={`w-full px-4 py-3.5 bg-slate-50 border text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right ${fieldErrors.phone ? "border-danger-500 focus:ring-danger-500/20" : "border-slate-200"}`} 
              id="phone" type="tel" name="phone" placeholder="01xxxxxxxxx" required 
            />
            {fieldErrors.phone && <p className="mt-1.5 text-sm text-danger-600 font-medium">{fieldErrors.phone}</p>}
            <p className="mt-1.5 text-xs text-slate-400">أدخل رقماً يبدأ بـ 01</p>
          </div>

          {role === "student" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="parentPhone">رقم هاتف ولي الأمر (اختياري)</label>
              <input 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right" 
                id="parentPhone" type="tel" name="parentPhone" placeholder="01xxxxxxxxx" 
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="password">كلمة المرور</label>
            <div className="relative">
              <input 
                className={`w-full px-4 py-3.5 bg-slate-50 border text-slate-900 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400 text-right pr-12 ${fieldErrors.password ? "border-danger-500 focus:ring-danger-500/20" : "border-slate-200"}`} 
                id="password" type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required 
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1.5 text-sm text-danger-600 font-medium">{fieldErrors.password}</p>}
            <p className="mt-1.5 text-xs text-slate-400">6 أحرف على الأقل</p>
          </div>

          <button
            className="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/50 transition-all shadow-lg hover:shadow-primary-500/30 outline-none flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}</span>
            {!loading && (
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            لديك حساب بالفعل؟
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold hover:underline underline-offset-4 mr-1">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
