import { useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { Route } from "./+types/teacher-classes";

export function meta() {
  return [{ title: "إدارة الفصول | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/teacher/classes");
  return data;
}

interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  _count: { students: number };
}

export default function TeacherClasses({ loaderData }: Route.ComponentProps) {
  const data = loaderData as { classes?: ClassItem[] };
  const classes = data?.classes || [];
  const [search, setSearch] = useState("");
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchId = "teacher-classes-search";

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!classToDelete) return;
    setIsDeleting(true);
    await apiFetch(`/teacher/classes/${classToDelete.id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="text-right">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-200 opacity-0 animate-reveal-up">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الفصول</h2>
          <p className="text-slate-500 mt-2 text-lg">قم بإنشاء وتنظيم فصول طلابك.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 flex-row-reverse">
          <div className="w-full md:w-auto">
            <label htmlFor={searchId} className="mb-2 block text-sm font-bold text-slate-700">
              ابحث في الفصول
            </label>
            <div className="relative">
              <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id={searchId}
                type="text"
                placeholder="ابحث عن الفصول..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-describedby={`${searchId}-hint`}
                className="w-full sm:w-72 pr-10 pl-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <span id={`${searchId}-hint`} className="sr-only">
              اكتب اسم الفصل لتصفية قائمة الفصول.
            </span>
          </div>
          <Link
            to="/teacher/classes/create"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-sm font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none shadow-lg shadow-primary-100 transition-all transform hover:-translate-y-0.5 animate-glow"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            فصل جديد
          </Link>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center opacity-0 animate-reveal-up delay-200">
          <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-3">لا توجد فصول دراسية</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">الفصول تساعدك في تنظيم طلابك في مجموعات. أنشئ فصلاً لإضافة الطلاب وتعيين الاختبارات.</p>
          <Link to="/teacher/classes/create" className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg transition-all hover:-translate-y-0.5">
            إنشاء فصل جديد
          </Link>
          <p className="text-xs text-slate-400 mt-4">💡 الفصول تساعدك في تنظيم طلابك وتعيين الاختبارات لكل مجموعة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, i) => (
            <div 
              key={c.id} 
              className={`bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-xl hover:border-primary-300 transition-all duration-300 group opacity-0 animate-reveal-up ${
                i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-300"
              }`}
            >
              <div className="flex justify-between items-start mb-6 flex-row-reverse">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{c.name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-primary-50 text-primary-700 border border-primary-100">
                  {c._count.students} طالب
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto pt-6 border-t border-slate-100 flex-row-reverse">
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:space-x-reverse">
                  <Link to={`/teacher/classes/${c.id}`} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                    عرض التفاصيل
                  </Link>
                  <button
                    onClick={() => setClassToDelete(c)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 border border-transparent text-xs font-bold rounded-xl text-danger-700 bg-danger-50 hover:bg-danger-100 transition-colors cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={classToDelete !== null}
        title="حذف الفصل"
        description={
          classToDelete
            ? `سيتم حذف الفصل "${classToDelete.name}" من قائمتك، ولن يتم حذف حسابات الطلاب أنفسهم.`
            : ""
        }
        confirmLabel="حذف الفصل"
        busy={isDeleting}
        onCancel={() => {
          if (!isDeleting) setClassToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
