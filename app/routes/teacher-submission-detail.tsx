import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-submission-detail";

export function meta() {
  return [{ title: "تفاصيل التقديم | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/teacher/quizzes/${params.quizId}/submissions/${params.submissionId}`);
  return data;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  imageUrl: string | null;
}

interface SubmissionData {
  quiz: { id: string; title: string; totalMarks: number; questions: Question[] };
  submission: {
    id: string;
    score: number;
    startedAt: string;
    submittedAt: string | null;
    answers: number[];
    violations?: { type: string; details: string; timestamp: string }[] | null;
    student: { id: string; name: string; phone: string };
  };
}

export default function TeacherSubmissionDetail({ loaderData }: Route.ComponentProps) {
  const data = loaderData as SubmissionData;
  const quiz = data?.quiz;
  const submission = data?.submission;

  if (!quiz || !submission) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const timeMins = submission.submittedAt
    ? ((new Date(submission.submittedAt).getTime() - new Date(submission.startedAt).getTime()) / 60000).toFixed(1)
    : "-";

  return (
    <div className="text-right">
      <div className="mb-8 pb-6 border-b border-slate-200">
        <p className="text-sm text-slate-500 mb-1">تقديم في: {quiz.title}</p>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{submission.student.name}</h2>
        <div className="mt-3 flex items-center gap-4 flex-row-reverse">
          <span className="text-lg font-black text-primary-600">{submission.score}/{quiz.totalMarks}</span>
          <span className="text-sm text-slate-500">{timeMins} دقيقة</span>
        </div>
      </div>

      {/* Anti-Cheat Violations */}
      {submission.violations && submission.violations.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2 flex-row-reverse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            سجل مخالفات النظام (Anti-Cheat)
          </h3>
          <ul className="space-y-3">
            {submission.violations.map((v, idx) => (
              <li key={idx} className="bg-white border border-rose-100 rounded-xl p-4 flex items-start justify-between flex-row-reverse shadow-sm">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">
                    {v.type === 'tab_switch' ? 'مغادرة صفحة الاختبار' : v.type}
                  </span>
                  <span className="text-sm text-slate-600 block">{v.details}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(v.timestamp).toLocaleTimeString('ar-EG')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions Review */}
      <div className="space-y-6">
        {(quiz.questions || []).map((q, i) => {
          const studentAnswer = submission.answers?.[i] ?? -1;
          const isCorrect = studentAnswer === q.correctOption;
          return (
            <div key={q.id} className={`bg-white rounded-2xl border p-6 ${isCorrect ? 'border-emerald-200' : 'border-rose-200'}`}>
              <div className="flex items-start justify-between flex-row-reverse mb-4">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <span className="text-sm font-bold text-slate-500">سؤال {i + 1}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {isCorrect ? "صحيح" : "خطأ"}
                  </span>
                </div>
              </div>

              <p className="font-bold text-slate-900 mb-4">{q.questionText}</p>

              {q.imageUrl && (
                <img src={q.imageUrl} alt="سؤال" className="max-w-sm rounded-xl mb-4 border border-slate-200" />
              )}

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isStudentChoice = optIdx === studentAnswer;
                  const isCorrectOption = optIdx === q.correctOption;
                  let bgClass = "bg-slate-50 border-slate-200 text-slate-700";
                  if (isCorrectOption) bgClass = "bg-emerald-50 border-emerald-300 text-emerald-800";
                  else if (isStudentChoice && !isCorrect) bgClass = "bg-rose-50 border-rose-300 text-rose-800";

                  return (
                    <div key={optIdx} className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-between flex-row-reverse ${bgClass}`}>
                      <span>{opt}</span>
                      {isCorrectOption && <span className="text-xs font-bold">✓ صحيح</span>}
                      {isStudentChoice && !isCorrect && <span className="text-xs font-bold">✗ إجابة الطالب</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
