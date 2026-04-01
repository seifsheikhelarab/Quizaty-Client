import { useState } from "react";
import { Link } from "react-router";
import { apiFetch, API_BASE } from "../utils/api";
import { ConfirmDialog } from "../components/ConfirmDialog";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
    await apiFetch(`/teacher/quizzes/${quiz.id}`, { method: "DELETE" });
    window.location.href = "/teacher/quizzes";
  };

  const now = new Date();
  const start = new Date(quiz.startTime);
  const end = new Date(quiz.endTime);
  const isActive = now >= start && now <= end;
  const isEnded = now > end;
  const getWhatsAppNumber = (phone: string) =>
    phone.startsWith("0") ? `20${phone.slice(1)}` : phone;
  const mobileSubmissionRows = submissions.map((sub) => {
    const timeMins = sub.submittedAt
      ? ((new Date(sub.submittedAt).getTime() - new Date(sub.startedAt).getTime()) / 60000).toFixed(1)
      : "-";

    return { ...sub, timeMins };
  });

  return (
    <div className="text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row-reverse md:items-end justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-row-reverse">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${isActive ? 'bg-success-50 text-success-700 border-success-100' : isEnded ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-warning-50 text-warning-700 border-warning-100'}`}>
              {isActive ? "نشط" : isEnded ? "منتهي" : "قادم"}
            </span>
            {quiz.showResults && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-50 text-secondary-700 border border-secondary-100">النتائج معلنة</span>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{quiz.title}</h2>
          {quiz.description && <p className="text-slate-500 mt-2 text-sm">{quiz.description}</p>}
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse flex-wrap gap-y-2 w-full md:w-auto">
          {limits?.reports && limits.reports !== 'basic' && (
            <a 
              href={`${API_BASE}/teacher/quizzes/${quiz.id}/export`} 
              target="_blank" 
              rel="noopener noreferrer" 
              download
              className="w-full sm:w-auto px-4 py-3 border text-sm font-bold rounded-lg text-success-700 bg-success-50 hover:bg-success-100 border-success-200 transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              تصدير Excel
            </a>
          )}
          <Link to={`/teacher/quizzes/${quiz.id}/edit`} className="w-full sm:w-auto px-4 py-3 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors text-center">تعديل</Link>
          {!quiz.showResults && (
            <button onClick={handleReleaseResults} className="w-full sm:w-auto px-4 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors cursor-pointer">إعلان النتائج</button>
          )}
          <button onClick={() => setShowDeleteDialog(true)} className="w-full sm:w-auto px-4 py-3 border border-slate-300 text-sm font-bold rounded-lg text-danger-600 bg-white hover:bg-danger-50 transition-colors cursor-pointer">حذف</button>
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
                <p className="text-lg font-black text-success-600">{analysis.bestScore}</p>
                <p className="text-xs text-slate-500">أعلى درجة</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-primary-600">{analysis.avgScore}</p>
                <p className="text-xs text-slate-500">المتوسط</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-danger-600">{analysis.worstScore}</p>
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
                       <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-warning-100 text-warning-700' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-secondary-100 text-secondary-700'}`}>
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
              <>
                <div className="space-y-3 p-4 sm:hidden">
                  {mobileSubmissionRows.map((sub) => (
                    <div key={sub.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3 flex-row-reverse">
                        <div>
                          <p className="font-bold text-slate-900">{sub.student.name}</p>
                          <p className="mt-1 text-sm font-medium text-primary-600">
                            {sub.score}/{quiz.totalMarks}
                          </p>
                        </div>
                        <Link
                          to={`/teacher/quizzes/${quiz.id}/submissions/${sub.id}`}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary-600 border border-slate-200"
                        >
                          عرض
                        </Link>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">الوقت المستغرق: {sub.timeMins} دقيقة</p>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    جدول يوضح التقديمات الخاصة باختبار {quiz.title}، بما في ذلك اسم الطالب والدرجة والوقت المستغرق ورابط عرض التفاصيل.
                  </caption>
                  <thead className="bg-slate-50 text-right">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-bold text-slate-600">الطالب</th>
                      <th scope="col" className="px-6 py-3 font-bold text-slate-600">الدرجة</th>
                      <th scope="col" className="px-6 py-3 font-bold text-slate-600">الوقت المستغرق</th>
                      <th scope="col" className="px-6 py-3 font-bold text-slate-600">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => {
                      const timeMins = sub.submittedAt ? ((new Date(sub.submittedAt).getTime() - new Date(sub.startedAt).getTime()) / 60000).toFixed(1) : '-';
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <th scope="row" className="px-6 py-4 font-medium text-slate-900">{sub.student.name}</th>
                          <td className="px-6 py-4 font-bold text-primary-600">{sub.score}/{quiz.totalMarks}</td>
                          <td className="px-6 py-4 text-slate-500">{timeMins} دقيقة</td>
                          <td className="px-6 py-4">
                            <Link to={`/teacher/quizzes/${quiz.id}/submissions/${sub.id}`} className="text-primary-600 hover:text-primary-800 text-xs font-bold">
                              عرض تفاصيل التقديم
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Non-Attempted Students (WhatsApp) */}
        {limits?.whatsapp !== 'none' && nonAttempted && nonAttempted.length > 0 && (
          <div className="bg-white rounded-2xl border border-warning-200 p-6">
            <h3 className="text-lg font-bold text-warning-800 mb-4">الطلاب الذين لم يقدموا الاختبار</h3>
            <div className="space-y-2">
              {nonAttempted.map((student: any) => (
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-warning-50 rounded-xl">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.phone}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {student.parentPhone && (
                      <a
                        href={`https://wa.me/${getWhatsAppNumber(student.parentPhone)}?text=${encodeURIComponent(`مرحباً، نود إبلاغكم بأن الطالب/الطالبة ${student.name} لم يقدم اختبار "${quiz.title}" حتى الآن. يرجى متابعته وتشجيعه على إتمام الاختبار في أقرب وقت.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 bg-success-500 text-white text-xs font-bold rounded-lg hover:bg-success-600 text-center"
                        aria-label={`إرسال تنبيه عبر واتساب إلى ولي أمر ${student.name} بشأن عدم تقديم الاختبار`}
                      >
                        واتساب ولي الأمر
                      </a>
                    )}
                    <a
                      href={`https://wa.me/${getWhatsAppNumber(student.phone)}?text=${encodeURIComponent(`مرحباً ${student.name}، لم تقدّم اختبار "${quiz.title}" حتى الآن. يرجى الدخول إلى المنصة وإتمام الاختبار في أقرب وقت.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 bg-success-500 text-white text-xs font-bold rounded-lg hover:bg-success-600 text-center"
                      aria-label={`إرسال تذكير عبر واتساب إلى ${student.name} لإتمام الاختبار`}
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
          <div className="bg-white rounded-2xl border border-danger-200 p-6">
            <h3 className="text-lg font-bold text-danger-800 mb-4">طلاب لديهم مخالفات</h3>
            <div className="space-y-2">
              {studentsWithViolations.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-danger-50 rounded-xl">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{item.student.name}</p>
                    <p className="text-xs text-danger-600">مخالفات: {item.violations?.length || 0}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {item.student.parentPhone && (
                      <a
                        href={`https://wa.me/${getWhatsAppNumber(item.student.parentPhone)}?text=${encodeURIComponent(`مرحباً، تم تسجيل مخالفات على الطالب/الطالبة ${item.student.name} أثناء أداء اختبار "${quiz.title}". يرجى التحدث معه ومراجعته بشأن هذه المخالفات.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 bg-success-500 text-white text-xs font-bold rounded-lg hover:bg-success-600 text-center"
                        aria-label={`إرسال تنبيه عبر واتساب إلى ولي أمر ${item.student.name} بشأن المخالفات المسجلة`}
                      >
                        واتساب ولي الأمر
                      </a>
                    )}
                    <Link
                      to={`/teacher/quizzes/${quiz.id}/submissions/${item.id}`}
                      className="px-3 py-2.5 border border-danger-300 text-danger-700 text-xs font-bold rounded-lg hover:bg-danger-100 text-center"
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
            <h3 className="text-lg font-bold text-slate-900 mb-4">التوقيتات</h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between flex-row-reverse">
                <span className="text-slate-500">البداية</span>
                <span className="font-medium text-slate-900">{new Date(quiz.startTime).toLocaleString("ar-EG")}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between flex-row-reverse">
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
      <ConfirmDialog
        open={showDeleteDialog}
        title="حذف الاختبار"
        description={`سيتم حذف اختبار "${quiz.title}" مع جميع الأسئلة والتقديمات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف الاختبار"
        busy={isDeleting}
        onCancel={() => {
          if (!isDeleting) setShowDeleteDialog(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
