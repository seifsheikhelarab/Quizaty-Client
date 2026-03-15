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
    <div className="text-right space-y-10">
      {/* Header & Search Section */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[3rem] p-8 md:p-12 opacity-0 animate-reveal-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">إدارة الاختبارات</h2>
            <p className="text-slate-500 text-lg max-w-md">قم ببناء وتقييم طلابك من خلال اختبارات تفاعلية وذكية.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row-reverse items-center gap-4">
            <div className="relative w-full sm:w-80 group">
              <svg className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ابحث عن اسم الاختبار..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-12 pl-5 py-4 bg-slate-50 border-none rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            
            <Link
              to="/teacher/quizzes/create"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white text-base font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all animate-glow"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              اختيار جديد
            </Link>
          </div>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-[4rem] border border-slate-200 p-16 md:p-24 text-center opacity-0 animate-reveal-up delay-200">
          <div className="w-24 h-24 bg-indigo-50 rounded-4xl flex items-center justify-center mx-auto mb-8 transform rotate-6 animate-float">
            <svg className="w-12 h-12 text-indigo-600 -rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4">لا توجد اختبارات في مكتبتك</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">ابدأ الآن بتصميم اختبارك الأول. يمكنك إضافة الأسئلة، تحديد المدة، ومتابعة نتائج طلابك بكل سهولة.</p>
          <Link to="/teacher/quizzes/create" className="inline-flex items-center justify-center px-10 py-4 text-lg font-black rounded-2xl text-white bg-slate-900 hover:bg-slate-800 shadow-2xl transition-all hover:-translate-y-1">
            أنشئ أول اختبار لك
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filtered.map((quiz, i) => {
            const status = getStatus(quiz);
            return (
              <div 
                key={quiz.id} 
                className={`group bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 opacity-0 animate-reveal-up ${
                  i % 4 === 0 ? "delay-100" : i % 4 === 1 ? "delay-150" : i % 4 === 2 ? "delay-200" : "delay-250"
                }`}
              >
                <div className="flex justify-between items-start mb-6 flex-row-reverse">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                    {status.label}
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                <Link to={`/teacher/quizzes/${quiz.id}`} className="block mb-6 text-right">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">{quiz.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-xs font-bold text-slate-400 flex-row-reverse">
                    <div className="flex items-center gap-1.5 flex-row-reverse">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>{quiz._count.questions} سؤال</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-row-reverse">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>{quiz.duration} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-row-reverse">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>{quiz._count.submissions} تقديم</span>
                    </div>
                  </div>
                </Link>

                <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between flex-row-reverse">
                  <div className="flex gap-3">
                    <Link 
                      to={`/teacher/quizzes/${quiz.id}`} 
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                      التفاصيل
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="p-2.5 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all active:scale-90 cursor-pointer"
                      title="حذف"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400">
                    {new Date(quiz.startTime).toLocaleDateString("ar-EG")}
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
