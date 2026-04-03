import { Link, redirect } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-dashboard";

export function meta() {
  return [{ title: "لوحة تحكم الطالب | Quizaty" }];
}

export async function clientLoader() {
  try {
    return await apiFetch("/student/dashboard");
  } catch (err: any) {
    if (err.status === 401 || err.status === 403) {
      throw redirect("/login");
    }
    throw err;
  }
}

export default function StudentDashboard({ loaderData }: Route.ComponentProps) {
  const data = loaderData as { student?: { name: string }; stats?: { upcomingQuizzes: number; classes: number } };
  const student = data?.student || { name: "" };
  const stats = data?.stats || { upcomingQuizzes: 0, classes: 0 };

  const isFirstTime = stats.classes === 0;

  if (isFirstTime) {
    return (
      <div className="text-right">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 px-6 py-6 shadow-sm backdrop-blur opacity-0 animate-reveal-up">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            مرحباً بك، {student.name || "طالب"}! 👋
          </h2>
          <p className="mt-2 text-lg text-slate-500">اختر وجهتك المفضلة وابدأ من أقرب خطوة تحتاجها الآن.</p>
        </div>

        <div className="rounded-[2rem] border border-secondary-200/60 bg-secondary-50/40 p-8 text-center opacity-0 animate-reveal-up delay-100">
          <div className="w-20 h-20 bg-secondary-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">ابدأ رحلتك التعليمية! 🎉</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">انضم إلى فصل دراسي من خلال الرابط الذي سيرسله معلمك، ثمابدأ بحل الاختبارات.</p>
          
          <div className="flex justify-center">
            <Link
              to="/student/classes"
              className="group bg-secondary-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-secondary-700 transition-all shadow-lg hover:shadow-secondary-500/30 flex items-center gap-3"
            >
              <span>استكشف فصولك</span>
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 px-6 py-6 shadow-sm backdrop-blur opacity-0 animate-reveal-up">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          مرحباً بك، {student.name || "طالب"}! 👋
        </h2>
        <p className="mt-2 text-lg text-slate-500">اختر وجهتك المفضلة وابدأ من أقرب خطوة تحتاجها الآن.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link to="/student/quizzes" className="group block rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md opacity-0 animate-reveal-up delay-100">
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-400 transition-colors rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900">{stats.upcomingQuizzes}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 tracking-wide">الاختبارات القادمة</p>
            <p className="mt-4 text-sm leading-6 text-slate-500">راجع مواعيد اختباراتك القادمة وابدأ الحل فور فتح الاختبار.</p>
          </div>
        </Link>

        <Link to="/student/classes" className="group block rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary-300 hover:shadow-md opacity-0 animate-reveal-up delay-200">
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center text-secondary-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-secondary-400 transition-colors rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900">{stats.classes}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 tracking-wide">الفصول الدراسية</p>
            <p className="mt-4 text-sm leading-6 text-slate-500">تابع الفصول التي انضممت إليها واعرف كل اختبار مرتبط بكل فصل.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
