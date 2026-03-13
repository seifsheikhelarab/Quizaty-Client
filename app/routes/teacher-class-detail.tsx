import { useState } from "react";
import { Link, useParams } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-class-detail";

export function meta() {
  return [{ title: "تفاصيل الفصل | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/teacher/classes/${params.id}`);
  return data;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  shortCode: string | null;
}

interface Quiz {
  id: string;
  title: string;
  duration: number;
  startTime: string;
}

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  students: Student[];
  quizzes: Quiz[];
}

export default function TeacherClassDetail({ loaderData }: Route.ComponentProps) {
  const { classData, limits } = loaderData as { classData: ClassData; limits: any };
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiFetch(`/teacher/classes/${classData.id}/students`, {
        method: "POST",
        body: JSON.stringify({ name: studentName, phone: studentPhone }),
      });
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("هل أنت متأكد من إزالة الطالب من الفصل؟")) return;
    await apiFetch(`/teacher/classes/${classData.id}/students/${studentId}`, { method: "DELETE" });
    window.location.reload();
  };

  const handleDeleteClass = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الفصل نهائياً؟")) return;
    await apiFetch(`/teacher/classes/${classData.id}`, { method: "DELETE" });
    window.location.href = "/teacher/classes";
  };

  return (
    <div className="text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row-reverse md:items-end justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
            فصل دراسي
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{classData.name}</h2>
          {classData.description && <p className="text-slate-500 mt-2 text-sm">{classData.description}</p>}
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 space-x-reverse">
          <Link
            to={`/teacher/classes/${classData.id}/edit`}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            تعديل الفصل
          </Link>
          <button
            onClick={handleDeleteClass}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
          >
            حذف الفصل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Students Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full text-right">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">الطلاب ({classData.students.length})</h3>
            </div>

            {/* Add Student Form */}
            <div className="p-6 border-b border-slate-100 bg-white text-right">
              <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row-reverse gap-4">
                <div className="grow">
                  <input
                    type="text"
                    placeholder="اسم الطالب"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  />
                </div>
                <div className="grow">
                  <input
                    type="text"
                    placeholder="رقم هاتف الطالب"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    required
                    className="block w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة
                  </button>
                </div>
              </form>
            </div>

            <div className="grow overflow-auto">
              {classData.students.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  لم يتم إضافة طلاب بعد. استخدم النموذج أعلاه لإضافة الطلاب.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {classData.students.map((student) => (
                    <li key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group flex-row-reverse">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{student.phone}</p>
                        {student.shortCode && (
                          <p className="text-xs font-mono text-indigo-600 mt-0.5">الكود: {student.shortCode}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 space-x-reverse">
                        {limits?.whatsapp !== 'none' && (
                          <a
                            href={`https://wa.me/${student.phone.startsWith('0') ? '2' + student.phone : student.phone}?text=${encodeURIComponent(`مرحباً بك في فصل "${classData.name}".${student.shortCode ? ` كود الدخول الخاص بك هو: ${student.shortCode}` : ''}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 hover:text-emerald-700 transition-colors p-1"
                            title="مراسلة عبر واتساب"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </a>
                        )}
                        <Link to={`/teacher/students/${student.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors">عرض</Link>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Quizzes Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-right">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">الاختبارات المسندة ({classData.quizzes.length})</h3>
            </div>
            <div className="p-4">
              {classData.quizzes.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">
                  لم يتم تعيين أي اختبارات لهذا الفصل بعد.
                </div>
              ) : (
                <div className="space-y-3">
                  {classData.quizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      to={`/teacher/quizzes/${quiz.id}`}
                      className="block p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
                    >
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{quiz.title}</h4>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 flex-row-reverse">
                        <span>{quiz.duration} دقيقة</span>
                        <span>{new Date(quiz.startTime).toLocaleDateString("ar-EG")}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
