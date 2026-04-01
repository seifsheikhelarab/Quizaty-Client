import { useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import { ConfirmDialog } from "../components/ConfirmDialog";
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
  const data = loaderData as { quizzes?: QuizItem[] };
  const quizzes = data?.quizzes || [];
  const [search, setSearch] = useState("");
  const [quizToDelete, setQuizToDelete] = useState<QuizItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchId = "teacher-quizzes-search";

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );
  const now = new Date();
  const upcomingCount = quizzes.filter((q) => new Date(q.startTime) > now).length;
  const activeCount = quizzes.filter((q) => {
    const start = new Date(q.startTime);
    const end = new Date(q.endTime);
    return now >= start && now <= end;
  }).length;
  const completedCount = quizzes.length - upcomingCount - activeCount;

  const getStatus = (quiz: QuizItem) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);
    if (now < start) return { label: "قادم", color: "bg-warning-50 text-warning-700 border-warning-200" };
    if (now >= start && now <= end) return { label: "نشط", color: "bg-secondary-50 text-secondary-700 border-secondary-200" };
    return { label: "منتهي", color: "bg-slate-100 text-slate-500 border-slate-200" };
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    await apiFetch(`/teacher/quizzes/${quizToDelete.id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="text-right space-y-10">
      {/* Header & Search Section */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 opacity-0 animate-reveal-up">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">إدارة الاختبارات</h2>
            <p className="text-slate-500 text-base md:text-lg max-w-md">أنشئ اختباراتك وتابع التقديمات والنتائج من مكان واحد.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-end gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-80">
              <label htmlFor={searchId} className="mb-2 block text-sm font-bold text-slate-700">
                ابحث عن اختبار
              </label>
              <div className="relative group">
              <svg className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id={searchId}
                type="text"
                placeholder="ابحث عن اسم الاختبار..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-describedby={`${searchId}-hint`}
                className="w-full pr-12 pl-5 py-4 bg-slate-50 border-none rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-inner"
              />
              </div>
              <span id={`${searchId}-hint`} className="sr-only">
                اكتب اسم الاختبار لتصفية القائمة.
              </span>
            </div>
            
            <Link
              to="/teacher/quizzes/create"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 bg-primary-600 text-white text-base font-black rounded-2xl hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              اختبار جديد
            </Link>
          </div>
        </div>
      </div>

      {quizzes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 opacity-0 animate-reveal-up delay-100">
          <div className="bg-white rounded-3xl border border-slate-200 px-5 py-4">
            <p className="text-xs font-bold text-slate-500">إجمالي الاختبارات</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{quizzes.length}</p>
          </div>
          <div className="bg-white rounded-3xl border border-warning-200 px-5 py-4">
            <p className="text-xs font-bold text-warning-700">اختبارات قادمة</p>
            <p className="mt-2 text-2xl font-black text-warning-800">{upcomingCount}</p>
          </div>
          <div className="bg-white rounded-3xl border border-secondary-200 px-5 py-4">
            <p className="text-xs font-bold text-secondary-700">اختبارات نشطة</p>
            <p className="mt-2 text-2xl font-black text-secondary-800">{activeCount}</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 px-5 py-4">
            <p className="text-xs font-bold text-slate-500">اختبارات منتهية</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-14 md:p-20 text-center opacity-0 animate-reveal-up delay-200">
          <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-7">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">لا توجد اختبارات في مكتبتك</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">أنشئ اختباراً إلكترونياً وشاركه مع طلابك. احصل على النتائج وتقارير فورية.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/teacher/quizzes/create" className="inline-flex items-center justify-center px-10 py-4 text-lg font-black rounded-2xl text-white bg-primary-600 hover:bg-primary-700 transition-colors">
              أنشئ أول اختبار لك
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-6">💡 نصيحة: أنشئ فصلاً لإضافة طلابك ثم عين الاختبارات لهم</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center opacity-0 animate-reveal-up delay-200">
          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-3">لا توجد نتائج مطابقة</h3>
          <p className="text-slate-500 max-w-sm mx-auto">جرّب اسماً مختلفاً أو امسح عبارة البحث لعرض جميع الاختبارات.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filtered.map((quiz, i) => {
            const status = getStatus(quiz);
            return (
              <div 
                key={quiz.id} 
                className={`group bg-white rounded-[2rem] border border-slate-200 p-7 flex flex-col hover:border-primary-200 transition-colors duration-300 opacity-0 animate-reveal-up ${
                  i % 4 === 0 ? "delay-100" : i % 4 === 1 ? "delay-150" : i % 4 === 2 ? "delay-200" : "delay-250"
                }`}
              >
                <div className="flex justify-between items-start mb-6 flex-row-reverse">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                    {status.label}
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 transition-colors group-hover:text-primary-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                <Link to={`/teacher/quizzes/${quiz.id}`} className="block mb-6 text-right">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-tight">{quiz.title}</h3>
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

                <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-row-reverse">
                  <div className="flex w-full sm:w-auto gap-3">
                    <Link 
                      to={`/teacher/quizzes/${quiz.id}`} 
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-3 bg-primary-600 text-white text-xs font-black rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      التفاصيل
                    </Link>
                    <button
                      onClick={() => setQuizToDelete(quiz)}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-danger-600 bg-danger-50 rounded-xl hover:bg-danger-100 transition-colors cursor-pointer"
                      title="حذف"
                      aria-label={`حذف الاختبار ${quiz.title}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-400 self-start sm:self-auto">
                    {new Date(quiz.startTime).toLocaleDateString("ar-EG")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={quizToDelete !== null}
        title="حذف الاختبار"
        description={
          quizToDelete
            ? `سيتم حذف اختبار "${quizToDelete.title}" مع جميع الأسئلة والتقديمات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel="حذف الاختبار"
        busy={isDeleting}
        onCancel={() => {
          if (!isDeleting) setQuizToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
