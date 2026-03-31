import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-class-detail";

export function meta() {
  return [{ title: "تفاصيل الفصل | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/student/classes/${params.id}`);
  return data;
}

export default function StudentClassDetail({ loaderData }: Route.ComponentProps) {
  const { classData, quizzes } = loaderData as {
    classData?: { id: string; name: string; description: string | null; shortCode: string; teacher: { id: string; name: string; phone: string } };
    quizzes?: { id: string; title: string; startTime: string; endTime: string; showResults: boolean }[];
  };

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const now = new Date();
  const activeQuizzes = (quizzes || []).filter(q => {
    const start = new Date(q.startTime);
    const end = new Date(q.endTime);
    return now >= start && now <= end;
  });
  const upcomingQuizzes = (quizzes || []).filter(q => new Date(q.startTime) > now);
  const pastQuizzes = (quizzes || []).filter(q => new Date(q.endTime) < now);

  const handleLeaveClass = async () => {
    if (!confirm("هل أنت متأكد من مغادرة هذا الفصل؟ لن تتمكن من العودة إلا بدعوة جديدة.")) return;
    try {
      await apiFetch(`/student/classes/${classData.id}`, { method: "DELETE" });
      window.location.href = "/student/classes";
    } catch (err: any) {
      alert(err.message || "فشل في مغادرة الفصل");
    }
  };

  return (
    <div className="text-right">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">فصل دراسي</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{classData.name}</h2>
            {classData.description && <p className="text-slate-500 mt-2 text-lg">{classData.description}</p>}
          </div>
          <div className="flex gap-3">
            {classData.teacher.phone && (
              <a
                href={`https://wa.me/${classData.teacher.phone.startsWith('0') ? '20' + classData.teacher.phone.slice(1) : classData.teacher.phone}?text=${encodeURIComponent(`مرحباً أستاذ/ة ${classData.teacher.name}، أريد الاستفسار عن فصل "${classData.name}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-emerald-200 text-sm font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                تواصل مع المعلم
              </a>
            )}
            <button
              onClick={handleLeaveClass}
              className="inline-flex items-center px-4 py-2 border border-rose-200 text-sm font-bold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              مغادرة الفصل
            </button>
          </div>
        </div>
        {classData.shortCode && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-100 rounded-xl">
            <span className="text-sm font-bold text-slate-700 ml-2">كود الفصل:</span>
            <span className="text-lg font-black text-primary-600">{classData.shortCode}</span>
          </div>
        )}
      </div>

      {/* Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeQuizzes.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6">
              <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                اختبارات مفتوحة الآن
              </h3>
              <div className="space-y-3">
                {activeQuizzes.map(q => (
                  <Link key={q.id} to={`/student/quizzes/${q.id}`} className="block p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{q.title}</span>
                      <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">مفتوح</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {upcomingQuizzes.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 p-6">
              <h3 className="text-lg font-bold text-amber-800 mb-4">اختبارات قادمة</h3>
              <div className="space-y-3">
                {upcomingQuizzes.map(q => (
                  <div key={q.id} className="block p-4 rounded-xl bg-amber-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{q.title}</span>
                      <span className="text-sm text-slate-500">{new Date(q.startTime).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastQuizzes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-700 mb-4">اختبارات سابقة</h3>
              <div className="space-y-3">
                {pastQuizzes.map(q => (
                  <Link key={q.id} to={`/student/quizzes/${q.id}`} className="block p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{q.title}</span>
                      {q.showResults && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-lg">تم إصدار النتيجة</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(activeQuizzes.length === 0 && upcomingQuizzes.length === 0 && pastQuizzes.length === 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <span className="text-4xl block mb-4">📝</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد اختبارات</h3>
              <p className="text-slate-500">لم يتم تعيين أي اختبارات لهذا الفصل بعد.</p>
            </div>
          )}
        </div>

        {/* Teacher Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">معلم الفصل</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-black text-primary-600">
                  {classData.teacher.name?.charAt(0) || "م"}
                </span>
              </div>
              <p className="font-bold text-slate-900">{classData.teacher.name}</p>
              <p className="text-sm text-slate-500 mt-1">المعلم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}