import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-quizzes";

export function meta() {
  return [{ title: "الاختبارات | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/student/quizzes");
  return data;
}

export default function StudentQuizzes({ loaderData }: Route.ComponentProps) {
  const { quizzes = [], submissionMap = {} } = loaderData as {
    quizzes?: { id: string; title: string; description: string | null; startTime: string; endTime: string; showResults: boolean; teacher: { name: string } }[];
    submissionMap?: Record<string, { quizId: string; submittedAt: string | null }>;
  };

  return (
    <div className="text-right">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">الاختبارات</h2>
        <p className="text-slate-500 mt-2 text-lg">جميع الاختبارات المخصصة لفصولك الدراسية.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">لا توجد اختبارات</h3>
          <p className="mx-auto max-w-md text-slate-500">لم يتم تعيين أي اختبارات لفصولك الدراسية بعد. ستظهر هنا فور مشاركة المعلم للاختبارات الجديدة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, i) => {
            const now = new Date();
            const startDate = new Date(quiz.startTime);
            const endDate = new Date(quiz.endTime);
            const isOpen = now >= startDate && now <= endDate;
            const isUpcoming = now < startDate;
            const statusText = isUpcoming ? "قادم" : isOpen ? "مفتوح" : "انتهى";
            const statusColor = isUpcoming ? "bg-warning-50 text-warning-700 border border-warning-200" : isOpen ? "bg-secondary-50 text-secondary-700 border border-secondary-200" : "bg-slate-100 text-slate-700 border border-slate-200";
            const sub = submissionMap[quiz.id];
            const hasSubmitted = sub && sub.submittedAt;
            const scoreReleased = quiz.showResults;
            const primaryActionClass = "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-all";

            return (
              <div 
                key={quiz.id} 
                className={`flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 text-right shadow-sm hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg transition-all opacity-0 animate-reveal-up ${
                  i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-300"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3 flex-row-reverse">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>{statusText}</span>
                  <span className="truncate text-xs font-bold text-slate-400">{quiz.teacher?.name || "المعلم"}</span>
                </div>
                <h3 className="mb-2 min-h-[3.5rem] text-xl font-bold leading-snug text-slate-900">{quiz.title}</h3>
                {quiz.description ? (
                  <p className="mb-4 min-h-[2.75rem] text-sm leading-6 text-slate-500 line-clamp-2">{quiz.description}</p>
                ) : (
                  <p className="mb-4 min-h-[2.75rem] text-sm leading-6 text-slate-400">لا توجد ملاحظات إضافية لهذا الاختبار.</p>
                )}
                <div className="mb-4 rounded-2xl bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3 flex-row-reverse">
                    <span className="font-bold text-slate-700">المدة الزمنية</span>
                    <span>{startDate.toLocaleDateString("ar-EG")} - {endDate.toLocaleDateString("ar-EG")}</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <Link to={`/student/quizzes/${quiz.id}`} className={`${primaryActionClass} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>
                    عرض التفاصيل
                  </Link>
                  {scoreReleased && hasSubmitted && (
                    <Link to={`/student/quizzes/${quiz.id}/result`} className={`${primaryActionClass} border border-transparent bg-primary-600 text-white hover:bg-primary-700`}>
                      عرض النتيجة
                    </Link>
                  )}
                  {isOpen && !hasSubmitted && (
                    <Link to={`/student/quizzes/${quiz.id}/test`} className={`${primaryActionClass} border border-transparent bg-secondary-600 text-white hover:bg-secondary-700 sm:col-span-2`}>
                      بدء الاختبار
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
