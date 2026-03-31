import { Link } from "react-router";
import { apiFetch, API_BASE } from "../utils/api";
import type { Route } from "./+types/teacher-quiz-detail";

export function meta() {
  return [{ title: "تفاصيل الاختبار | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/teacher/quizzes/${params.id}`);
  return data;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  imageUrl: string | null;
}

interface Submission {
  id: string;
  score: number;
  startedAt: string;
  submittedAt: string | null;
  answers: number[];
  student: { id: string; name: string; phone: string };
}

interface QuizData {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    duration: number;
    totalMarks: number;
    showResults: boolean;
    questions: Question[];
    classes: { id: string; name: string; _count?: { students: number } }[];
  };
  analysis: Record<string, string>;
  leaderboard: Submission[];
  submissions: Submission[];
  limits?: Record<string, any>;
  nonAttempted?: any[];
  studentsWithViolations?: any[];
}

export default function TeacherQuizDetail({ loaderData }: Route.ComponentProps) {
  const data = loaderData as QuizData;
  const quiz = data?.quiz;
  const analysis = data?.analysis || {};
  const leaderboard = data?.leaderboard || [];
  const submissions = data?.submissions || [];
  const limits = data?.limits || {};
  const nonAttempted = data?.nonAttempted || [];
  const studentsWithViolations = data?.studentsWithViolations || [];

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const handleReleaseResults = async () => {
    await apiFetch(`/teacher/quizzes/${quiz.id}/release-results`, { method: "POST" });
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الاختبار؟ سيتم حذف جميع الأسئلة والتقديمات.")) return;
    await apiFetch(`/teacher/quizzes/${quiz.id}`, { method: "DELETE" });
    window.location.href = "/teacher/quizzes";
  };

  const now = new Date();
  const start = new Date(quiz.startTime);
  const end = new Date(quiz.endTime);
  const isActive = now >= start && now <= end;
  const isEnded = now > end;

  return (
    <div className="text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row-reverse md:items-end justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-row-reverse">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : isEnded ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
              {isActive ? "نشط" : isEnded ? "منتهي" : "قادم"}
            </span>
            {quiz.showResults && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">النتائج معلنة</span>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{quiz.title}</h2>
          {quiz.description && <p className="text-slate-500 mt-2 text-sm">{quiz.description}</p>}
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 space-x-reverse flex-wrap gap-y-2">
          {limits?.reports && limits.reports !== 'basic' && (
            <a 
              href={`${API_BASE}/teacher/quizzes/${quiz.id}/export`} 
              target="_blank" 
              rel="noopener noreferrer" 
              download
              className="px-4 py-2 border text-sm font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              تصدير Excel
            </a>
          )}
          <Link to={`/teacher/quizzes/${quiz.id}/edit`} className="px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">تعديل</Link>
          {!quiz.showResults && (
            <button onClick={handleReleaseResults} className="px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors cursor-pointer">إعلان النتائج</button>
          )}
          <button onClick={handleDelete} className="px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-rose-600 bg-white hover:bg-rose-50 transition-colors cursor-pointer">حذف</button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-slate-900">{quiz.questions?.length || 0}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">سؤال</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-slate-900">{quiz.duration}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">دقيقة</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-slate-900">{quiz.totalMarks}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">درجة</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-slate-900">{analysis.participation}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">مشاركة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis & Submissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">تحليل الأداء</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-lg font-black text-emerald-600">{analysis.bestScore}</p>
                <p className="text-xs text-slate-500">أعلى درجة</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-primary-600">{analysis.avgScore}</p>
                <p className="text-xs text-slate-500">المتوسط</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-rose-600">{analysis.worstScore}</p>
                <p className="text-xs text-slate-500">أقل درجة</p>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          {limits?.leaderboard && leaderboard.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">المتصدرون</h3>
              <div className="space-y-3">
                {leaderboard.map((sub, i) => (
                  <div key={sub.id} className="flex items-center justify-between flex-row-reverse p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3 flex-row-reverse">
                       <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
                        {i + 1}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{sub.student.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary-600">{sub.score}/{quiz.totalMarks}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">التقديمات ({submissions?.length || 0})</h3>
            </div>
            {(!submissions || submissions.length === 0) ? (
              <div className="p-8 text-center text-slate-500 text-sm">لا توجد تقديمات بعد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-right">
                    <tr>
                      <th className="px-6 py-3 font-bold text-slate-600">الطالب</th>
                      <th className="px-6 py-3 font-bold text-slate-600">الدرجة</th>
                      <th className="px-6 py-3 font-bold text-slate-600">الوقت</th>
                      <th className="px-6 py-3 font-bold text-slate-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => {
                      const timeMins = sub.submittedAt ? ((new Date(sub.submittedAt).getTime() - new Date(sub.startedAt).getTime()) / 60000).toFixed(1) : '-';
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">{sub.student.name}</td>
                          <td className="px-6 py-4 font-bold text-primary-600">{sub.score}/{quiz.totalMarks}</td>
                          <td className="px-6 py-4 text-slate-500">{timeMins} دقيقة</td>
                          <td className="px-6 py-4">
                            <Link to={`/teacher/quizzes/${quiz.id}/submissions/${sub.id}`} className="text-primary-600 hover:text-primary-800 text-xs font-bold">عرض</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Non-Attempted Students (WhatsApp) */}
        {limits?.whatsapp !== 'none' && nonAttempted && nonAttempted.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 p-6">
            <h3 className="text-lg font-bold text-amber-800 mb-4">الطلاب الذين لم يقدموا الاختبار</h3>
            <div className="space-y-2">
              {nonAttempted.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {student.parentPhone && (
                      <a
                        href={`https://wa.me/${student.parentPhone.startsWith('0') ? '20' + student.parentPhone.slice(1) : student.parentPhone}?text=${encodeURIComponent(`ن提醒: لم يقدم hijo/a ${student.name} الاختبار. يرجى التشجيع على تقديمه.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600"
                      >
                        واتساب ولي الأمر
                      </a>
                    )}
                    <a
                      href={`https://wa.me/${student.phone.startsWith('0') ? '20' + student.phone.slice(1) : student.phone}?text=${encodeURIComponent(`مرحباً ${student.name}، لم تقم بتقديم الاختبار "${quiz.title}". يرجى الدخول وإجراء الاختبار.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600"
                    >
                      واتساب
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students with Violations */}
        {limits?.whatsapp !== 'none' && studentsWithViolations && studentsWithViolations.length > 0 && (
          <div className="bg-white rounded-2xl border border-rose-200 p-6">
            <h3 className="text-lg font-bold text-rose-800 mb-4">طلاب لديهم مخالفات</h3>
            <div className="space-y-2">
              {studentsWithViolations.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{item.student.name}</p>
                    <p className="text-xs text-rose-600">مخالفات: {item.violations?.length || 0}</p>
                  </div>
                  <div className="flex gap-2">
                    {item.student.parentPhone && (
                      <a
                        href={`https://wa.me/${item.student.parentPhone.startsWith('0') ? '20' + item.student.parentPhone.slice(1) : item.student.parentPhone}?text=${encodeURIComponent(`تنبيه: تم تسجيل مخالفات أثناء خوض child ${item.student.name} للاختبار. يرجى التحدث معه.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600"
                      >
                        واتساب ولي الأمر
                      </a>
                    )}
                    <Link
                      to={`/teacher/quizzes/${quiz.id}/submissions/${item.id}`}
                      className="px-3 py-1.5 border border-rose-300 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100"
                    >
                      عرض
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar: Classes & Date */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">التوقيات</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500">البداية</span>
                <span className="font-medium text-slate-900">{new Date(quiz.startTime).toLocaleString("ar-EG")}</span>
              </div>
              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500">النهاية</span>
                <span className="font-medium text-slate-900">{new Date(quiz.endTime).toLocaleString("ar-EG")}</span>
              </div>
            </div>
          </div>

          {quiz.classes?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">الفصول المسندة</h3>
              <div className="space-y-2">
                {(quiz.classes || []).map((c) => (
                  <Link key={c.id} to={`/teacher/classes/${c.id}`} className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="font-bold text-sm text-slate-900">{c.name}</span>
                    <span className="text-xs text-slate-500 mr-2">({c._count?.students || 0} طالب)</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
