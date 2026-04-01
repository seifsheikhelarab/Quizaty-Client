import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../utils/api";

export function meta() {
  return [{ title: "إنشاء فصل جديد | Quizaty" }];
}

export default function TeacherCreateClass() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const data = await apiFetch("/teacher/classes", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description"),
          studentPhones: form.get("studentPhones"),
        }),
      });
      navigate(`/teacher/classes/${data.classData.id}`);
    } catch (err: any) {
      setError(err.message || "فشل إنشاء الفصل");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right";

  return (
    <div className="max-w-xl mx-auto text-right">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">إنشاء فصل جديد</h2>
        <p className="text-slate-500 mt-2 text-lg">قم بإعداد فصل جديد لتنظيم طلابك.</p>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-600 px-5 py-4 rounded-xl mb-6 text-sm font-medium">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">اسم الفصل</label>
              <input type="text" name="name" id="name" required className={inputCls} placeholder="مثال: رياضيات الصف العاشر" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                وصف الفصل <span className="text-slate-400 font-normal mr-1">(اختياري)</span>
              </label>
              <textarea name="description" id="description" rows={3} className={inputCls} placeholder="وصف موجز للفصل" />
            </div>
            <div>
              <label htmlFor="studentPhones" className="block text-sm font-bold text-slate-700 mb-2">
                إضافة طلاب <span className="text-slate-400 font-normal mr-1">(اختياري)</span>
              </label>
              <textarea name="studentPhones" id="studentPhones" rows={4} dir="ltr" className={`${inputCls} text-left!`} placeholder="رقم هاتف واحد في كل سطر (مثال: 01234567890)" />
              <p className="mt-2 text-sm text-slate-500">أدخل أرقام الهواتف، واحد في كل سطر. سيتم إنشاء الطلاب أو ربطهم إذا كانوا موجودين بالفعل.</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end space-x-4 space-x-reverse">
            <Link to="/teacher/classes" className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              إلغاء
            </Link>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-50 cursor-pointer">
              {loading ? "جاري الإنشاء..." : "إنشاء الفصل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
