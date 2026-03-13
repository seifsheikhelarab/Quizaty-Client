import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-quiz-detail";

export function meta() {
  return [{ title: "تفاصيل الاختبار | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/student/quizzes/${params.id}`);
  return data;
}

export default function StudentQuizDetail({ loaderData }: Route.ComponentProps) {
  const { quiz, submission } = loaderData as {
    quiz: {
      id: string;
      title: string;
      description: string | null;
      startTime: string;
      endTime: string;
      duration: number;
      totalMarks: number;
      teacher: { name: string };
    };
    submission: {
      id: string;
      score: number | null;
      submittedAt: string | null;
    } | null;
  };

  const now = new Date();
  const start = new Date(quiz.startTime);
  const end = new Date(quiz.endTime);

  const isActive = now >= start && now <= end;
  const isEnded = now > end;
  const isUpcoming = now < start;

  const hasSubmitted = submission?.submittedAt;

  return (
    <div className="max-w-3xl mx-auto text-right">
      <div className="mb-8">
        <Link to="/student/quizzes" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          العودة للاختبارات
        </Link>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{quiz.title}</h2>
        {quiz.description && <p className="text-slate-500 mt-2 text-lg">{quiz.description}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">المعلم</p>
            <p className="font-medium text-slate-900">{quiz.teacher.name || "معلم"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">المدة</p>
            <p className="font-medium text-slate-900">{quiz.duration} دقيقة</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">الدرجة الكلية</p>
            <p className="font-medium text-slate-900">{quiz.totalMarks}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">الحالة</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isUpcoming ? "bg-amber-100 text-amber-800" : isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
            }`}>
              {isUpcoming ? "قادم" : isActive ? "مفتوح" : "انتهى"}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 flex-row-reverse">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
              ⏱️
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">يبدأ في</p>
              <p className="text-sm text-slate-500">{start.toLocaleString("ar-EG")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 flex-row-reverse">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
              ⚠️
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">ينتهي في</p>
              <p className="text-sm text-slate-500">{end.toLocaleString("ar-EG")}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          {hasSubmitted ? (
            <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-3xl mb-2 block">✅</span>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">تم إكمال الاختبار</h3>
              <p className="text-emerald-700 text-sm mb-4">لقد قمت بتسليم إجاباتك لهذا الاختبار.</p>
              <Link to={`/student/quizzes/${quiz.id}/result`} className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                عرض النتيجة
              </Link>
            </div>
          ) : isUpcoming ? (
            <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-3xl mb-2 block">⏳</span>
              <h3 className="text-lg font-bold text-amber-900 mb-1">الاختبار لم يبدأ بعد</h3>
              <p className="text-amber-700 text-sm">يرجى العودة في الموعد المحدد للبدء.</p>
            </div>
          ) : isEnded ? (
            <div className="text-center p-6 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-3xl mb-2 block">🔒</span>
              <h3 className="text-lg font-bold text-rose-900 mb-1">انتهى وقت الاختبار</h3>
              <p className="text-rose-700 text-sm">لم يعد بإمكانك أداء هذا الاختبار.</p>
            </div>
          ) : (
            <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">تعليمات الاختبار</h3>
              <ul className="text-sm text-indigo-700 text-right list-disc list-inside mb-6 space-y-1">
                <li>مدة الاختبار {quiz.duration} دقيقة، وسيبدأ المؤقت فور دخولك.</li>
                <li>تأكد من استقرار اتصال الإنترنت قبل البدء.</li>
                <li>يتم حفظ إجاباتك تلقائياً أثناء الحل.</li>
                <li>سيتم تسليم إجاباتك تلقائياً عند انتهاء الوقت إذا لم تقم بالتسليم يدوياً.</li>
              </ul>
              <Link to={`/student/quizzes/${quiz.id}/test`} className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:scale-105">
                ابدأ الاختبار الآن
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
