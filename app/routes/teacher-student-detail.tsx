import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-student-detail";

export function meta() {
  return [{ title: "تفاصيل الطالب | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/teacher/students/${params.id}`);
  return data;
}

interface StudentData {
  student: {
    id: string;
    name: string;
    phone: string;
    shortCode: string | null;
    class: { id: string; name: string } | null;
    submissions: {
      id: string;
      score: number;
      submittedAt: string | null;
      quiz: { id: string; title: string; totalMarks: number };
    }[];
  };
  analysis: { bestScore: string; worstScore: string; avgScore: string };
}

export default function TeacherStudentDetail({ loaderData }: Route.ComponentProps) {
  const { student, analysis } = loaderData as StudentData;

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const submissions = student.submissions || [];

  return (
    <div className="text-right">
      <div className="mb-8 pb-6 border-b border-slate-200">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">طالب</span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{student.name}</h2>
        <p className="text-slate-500 mt-1 text-sm">{student.phone}</p>
        {student.class && (
          <Link to={`/teacher/classes/${student.class.id}`} className="text-primary-600 hover:text-primary-800 text-sm font-bold mt-1 inline-block">
            الفصل: {student.class.name}
          </Link>
        )}
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-2xl font-black text-emerald-600">{analysis.bestScore}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">أعلى درجة</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-2xl font-black text-primary-600">{analysis.avgScore}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">المتوسط</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <p className="text-2xl font-black text-rose-600">{analysis.worstScore}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">أقل درجة</p>
        </div>
      </div>

      {/* Submissions History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">سجل الاختبارات ({submissions.length})</h3>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">لم يقدم هذا الطالب أي اختبارات بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-right">
                <tr>
                  <th className="px-6 py-3 font-bold text-slate-600">الاختبار</th>
                  <th className="px-6 py-3 font-bold text-slate-600">الدرجة</th>
                  <th className="px-6 py-3 font-bold text-slate-600">التاريخ</th>
                  <th className="px-6 py-3 font-bold text-slate-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{sub.quiz.title}</td>
                    <td className="px-6 py-4 font-bold text-primary-600">{sub.score}/{sub.quiz.totalMarks}</td>
                    <td className="px-6 py-4 text-slate-500">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("ar-EG") : "لم يُقدم"}</td>
                    <td className="px-6 py-4">
                      <Link to={`/teacher/quizzes/${sub.quiz.id}/submissions/${sub.id}`} className="text-primary-600 hover:text-primary-800 text-xs font-bold">عرض</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
