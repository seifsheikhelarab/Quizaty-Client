import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-result";

export function meta() {
  return [{ title: "تفاصيل التسليم | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/student/quizzes/${params.id}/result`);
  return data;
}

export default function StudentResult({ loaderData }: Route.ComponentProps) {
  const { submission } = loaderData as any;
  if (!submission?.quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">حدث خطأ في تحميل النتيجة</p>
      </div>
    );
  }
  const quiz = submission.quiz;
  const timeTakenMins = submission.submittedAt
    ? ((new Date(submission.submittedAt).getTime() - new Date(submission.startedAt).getTime()) / 60000).toFixed(1)
    : "غير متوفر";
  
  const isPassed = submission.score >= quiz.totalMarks / 2;
  const scoreColor = isPassed ? "text-emerald-600" : "text-rose-600";
  let answers: Record<string, string> = {};
  if (submission.answers) {
    answers = typeof submission.answers === "string" ? JSON.parse(submission.answers) : submission.answers;
  }

  return (
    <div className="max-w-4xl mx-auto text-right">
      <div className="mb-8 opacity-0 animate-reveal-up">
        <Link to="/student/quizzes" className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-800 mb-4 transition-colors group">
          <svg className="w-4 h-4 mr-1 rotate-180 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          العودة للاختبارات
        </Link>
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-primary-50 text-primary-700 mb-3 border border-primary-100 uppercase tracking-wide">{quiz.title}</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">تفاصيل التسليم</h2>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 font-medium flex-row-reverse">
          {quiz.showResults ? (
            <>
              <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex-row-reverse opacity-0 animate-reveal-up delay-100">
                <span className="text-xs uppercase text-slate-400 mr-2">الدرجة</span>
                <span className={`text-lg font-black ${scoreColor} mr-2`}>{submission.score}</span>
                <span className="text-slate-400">/{quiz.totalMarks}</span>
              </div>
              <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex-row-reverse opacity-0 animate-reveal-up delay-200">
                <span className="text-xs uppercase text-slate-400 mr-2">الوقت المستغرق</span>
                <span className="text-slate-900 font-bold mr-2">{timeTakenMins} دقيقة</span>
              </div>
            </>
          ) : (
            <div className="flex items-center bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 shadow-sm flex-row-reverse opacity-0 animate-reveal-up delay-100">
              <span className="text-xs uppercase text-amber-500 mr-2">الحالة</span>
              <span className="text-amber-700 font-bold mr-2">بانتظار إصدار النتيجة</span>
            </div>
          )}
          <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex-row-reverse opacity-0 animate-reveal-up delay-300">
            <span className="text-xs uppercase text-slate-400 mr-2">تاريخ التسليم</span>
            <span className="text-slate-900 mr-2">{new Date(submission.submittedAt || submission.startedAt).toLocaleString("ar-EG")}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center opacity-0 animate-reveal-up delay-400">
        {quiz.showResults ? (
          <div className="w-full text-right">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 mb-8 -mx-8 -mt-8 text-right">
              <h3 className="font-black text-slate-900">إجاباتك مقابل الإجابات الصحيحة</h3>
            </div>
            
            <div className="space-y-8">
              {quiz.questions.map((q: any, index: number) => {
                const studentAnswerStr = answers[q.id];
                const studentAnswer = studentAnswerStr !== undefined ? parseInt(studentAnswerStr) : -1;
                const isCorrect = studentAnswer === q.correctOption;
                let badgeColor = "bg-slate-100 text-slate-600 font-bold";
                let badgeText = "تم التخطي";
                if (studentAnswer !== -1) {
                  badgeColor = isCorrect ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-rose-100 text-rose-800 font-bold";
                  badgeText = isCorrect ? "صحيحة" : "خاطئة";
                }

                return (
                  <div 
                    key={q.id} 
                    className={`border border-slate-100 rounded-2xl p-6 bg-white shadow-sm relative overflow-hidden group opacity-0 animate-reveal-up ${
                      index === 0 ? "delay-500" : index === 1 ? "delay-600" : "delay-700"
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${isCorrect ? 'bg-emerald-500' : (studentAnswer !== -1 ? 'bg-rose-500' : 'bg-slate-300')}`}></div>
                    <div className="pr-3">
                      <div className="flex justify-between items-start mb-6 flex-row-reverse">
                        <h4 className="text-lg font-black text-slate-900 leading-snug pl-4 text-right flex-1">
                          <span className="text-slate-400 ml-1">{index + 1}.</span> {q.questionText}
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shrink-0 ${badgeColor}`}>{badgeText}</span>
                      </div>
                      {q.imageUrl && (
                        <div className="mb-6"><img src={q.imageUrl} alt="سؤال" className="max-h-64 rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform" /></div>
                      )}
                      <div className="space-y-3 mt-4">
                        {q.options.map((opt: string, optIndex: number) => {
                          const isSelected = studentAnswer === optIndex;
                          const isActualCorrect = q.correctOption === optIndex;
                          let optClass = "border-slate-100 text-slate-600 bg-white opacity-80";
                          let label = "";
                          if (isSelected && isActualCorrect) {
                            optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-black shadow-sm ring-1 ring-emerald-500 opacity-100";
                            label = "إجابتك ✓ صحيحة";
                          } else if (isSelected && !isActualCorrect) {
                            optClass = "border-rose-300 bg-rose-50 text-rose-900 font-black shadow-sm ring-1 ring-rose-300 opacity-100";
                            label = "إجابتك ✗";
                          } else if (isActualCorrect) {
                            optClass = "border-emerald-200 bg-emerald-50/50 text-emerald-700 border-dashed opacity-100";
                            label = "الإجابة الصحيحة";
                          }

                          return (
                            <div key={optIndex} className={`flex items-center justify-between p-4 rounded-xl border text-sm flex-row-reverse transition-all ${optClass}`}>
                              <span className="font-bold text-right">{opt}</span>
                              {label && <span className="text-xs font-black shrink-0 opacity-0 animate-reveal-up">{label}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 animate-float">
              <svg className="w-10 h-10 text-amber-600 rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">النتائج لم تصدر بعد</h3>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
              لقد أكملت الاختبار بنجاح. سيقوم المعلم بإصدار النتائج وتوزيع الدرجات بمجرد انتهاء وقت الاختبار للجميع.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-primary-600 font-bold text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              يتم الآن مراجعة الاختبار
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 opacity-0 animate-reveal-up delay-500">
        <Link to="/student/quizzes" className="w-full inline-block text-center bg-primary-600 text-white font-black py-5 rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-100 active:scale-95">
          العودة لقائمة الاختبارات
        </Link>
      </div>
    </div>
  );
}
