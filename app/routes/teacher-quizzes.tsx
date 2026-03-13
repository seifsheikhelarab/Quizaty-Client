import { useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-quizzes";

export function meta() {
  return [{ title: "إدارة الاختبارات | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/teacher/quizzes");
  return data;
}

interface QuizItem {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  _count: { questions: number; submissions: number };
}

export default function TeacherQuizzes({ loaderData }: Route.ComponentProps) {
  const { quizzes } = loaderData as { quizzes: QuizItem[] };
  const [search, setSearch] = useState("");

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (quiz: QuizItem) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);
    if (now < start) return { label: "قادم", color: "bg-amber-50 text-amber-700 border-amber-100" };
    if (now >= start && now <= end) return { label: "نشط", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    return { label: "منتهي", color: "bg-slate-100 text-slate-500 border-slate-200" };
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الاختبار؟ سيتم حذف جميع الأسئلة والتقديمات.")) return;
    await apiFetch(`/teacher/quizzes/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="text-right">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الاختبارات</h2>
          <p className="text-slate-500 mt-2 text-lg">أنشئ وأدر اختباراتك.</p>
        </div>
        <div className="mt-6 md:mt-0 flex items-center flex-row-reverse">
          <div className="relative ml-4">
            <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ابحث عن الاختبارات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
          </div>
          <Link
            to="/teacher/quizzes/create"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            اختبار جديد
          </Link>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد اختبارات بعد</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">أنشئ اختبارك الأول وابدأ بتقييم طلابك.</p>
          <Link to="/teacher/quizzes/create" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
            إنشاء أول اختبار
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((quiz) => {
            const status = getStatus(quiz);
            return (
              <div key={quiz.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4 flex-row-reverse">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 flex-row-reverse">
                  <span>{quiz._count.questions} سؤال</span>
                  <span>•</span>
                  <span>{quiz.duration} دقيقة</span>
                  <span>•</span>
                  <span>{quiz._count.submissions} تقديم</span>
                </div>

                <div className="text-xs text-slate-400 mb-6">
                  {new Date(quiz.startTime).toLocaleDateString("ar-EG")} — {new Date(quiz.endTime).toLocaleDateString("ar-EG")}
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 flex-row-reverse">
                  <div className="flex space-x-2 space-x-reverse">
                    <Link to={`/teacher/quizzes/${quiz.id}`} className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                      عرض التفاصيل
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
