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

  return (
    <div className="text-right">
      <div className="mb-12 opacity-0 animate-reveal-up">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          مرحباً بك، {student.name || "طالب"}! 👋
        </h2>
        <p className="text-slate-500 mt-2 text-lg">اختر وجهتك المفضلة.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link to="/student/quizzes" className="block bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 group opacity-0 animate-reveal-up delay-100">
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
          </div>
        </Link>

        <Link to="/student/classes" className="block bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 group opacity-0 animate-reveal-up delay-200">
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900">{stats.classes}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 tracking-wide">الفصول الدراسية</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
