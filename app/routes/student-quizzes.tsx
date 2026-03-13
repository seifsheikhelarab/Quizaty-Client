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
  const { quizzes, submissionMap } = loaderData as {
    quizzes: { id: string; title: string; description: string | null; startTime: string; endTime: string; showResults: boolean; teacher: { name: string } }[];
    submissionMap: Record<string, { quizId: string; submittedAt: string | null }>;
  };

  return (
    <div className="text-right">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">الاختبارات</h2>
        <p className="text-slate-500 mt-2 text-lg">جميع الاختبارات المخصصة لفصولك الدراسية.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد اختبارات</h3>
          <p className="text-slate-500">لم يتم تعيين أي اختبارات لفصولك الدراسية بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const now = new Date();
            const startDate = new Date(quiz.startTime);
            const endDate = new Date(quiz.endTime);
            const isOpen = now >= startDate && now <= endDate;
            const isEnded = now > endDate;
            const isUpcoming = now < startDate;
            const statusText = isUpcoming ? "قادم" : isOpen ? "مفتوح" : "انتهى";
            const statusColor = isUpcoming ? "bg-amber-100 text-amber-800" : isOpen ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800";
            const sub = submissionMap[quiz.id];
            const hasSubmitted = sub && sub.submittedAt;
            const scoreReleased = quiz.showResults;

            return (
              <div key={quiz.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-md hover:border-indigo-300 transition-all text-right">
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>{statusText}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{quiz.title}</h3>
                {quiz.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{quiz.description}</p>}
                <div className="text-sm text-slate-500 mb-2">
                  {startDate.toLocaleDateString("ar-EG")} - {endDate.toLocaleDateString("ar-EG")}
                </div>
                <p className="text-xs font-bold text-indigo-600 mb-4">{quiz.teacher?.name || "معلم"}</p>

                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 flex-row-reverse">
                  <Link to={`/student/quizzes/${quiz.id}`} className="inline-flex items-center justify-center px-3 py-2 border border-slate-300 text-xs font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                    عرض التفاصيل
                  </Link>
                  {scoreReleased && hasSubmitted && (
                    <Link to={`/student/quizzes/${quiz.id}/result`} className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                      عرض النتيجة
                    </Link>
                  )}
                  {isOpen && !hasSubmitted && (
                    <Link to={`/student/quizzes/${quiz.id}/test`} className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
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
