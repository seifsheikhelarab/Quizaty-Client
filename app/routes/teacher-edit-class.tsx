import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-edit-class";

export function meta() {
  return [{ title: "تعديل الفصل | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/teacher/classes/${params.id}`);
  return data;
}

export default function TeacherEditClass({ loaderData }: Route.ComponentProps) {
  const data = loaderData as { classData?: { id: string; name: string; description: string | null } };
  const classData = data?.classData;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch(`/teacher/classes/${classData.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description"),
        }),
      });
      navigate(`/teacher/classes/${classData.id}`);
    } catch (err: any) {
      setError(err.message || "فشل تحديث الفصل");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "block w-full border border-slate-300 rounded-lg py-2.5 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right";

  return (
    <div className="max-w-xl mx-auto text-right">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">تعديل الفصل: {classData.name}</h2>
        <p className="text-slate-500 mt-2 text-lg">قم بتحديث بيانات هذا الفصل.</p>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-600 px-5 py-4 rounded-xl mb-6 text-sm font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">اسم الفصل</label>
              <input type="text" name="name" id="name" defaultValue={classData.name} required className={inputCls} />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                وصف الفصل <span className="text-slate-400 font-normal mr-1">(اختياري)</span>
              </label>
              <textarea name="description" id="description" rows={3} defaultValue={classData.description || ""} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse">
          <Link to={`/teacher/classes/${classData.id}`} className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 shadow-sm text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            إلغاء
          </Link>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
