import { useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../utils/api";
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
  const { classes } = loaderData as { classes: ClassItem[] };
  const [search, setSearch] = useState("");

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفصل؟ لن يتم حذف الطلاب.")) return;
    await apiFetch(`/teacher/classes/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="text-right">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الفصول</h2>
          <p className="text-slate-500 mt-2 text-lg">قم بإنشاء وتنظيم فصول طلابك.</p>
        </div>
        <div className="mt-6 md:mt-0 flex items-center flex-row-reverse">
          <div className="relative ml-4">
            <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ابحث عن الفصول..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
          </div>
          <Link
            to="/teacher/classes/create"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            فصل جديد
          </Link>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد فصول بعد</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">قم بإنشاء فصول لتنظيم طلابك وتعيين الاختبارات لمجموعات محددة.</p>
          <Link to="/teacher/classes/create" className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none shadow-sm transition-colors">
            إنشاء أول فصل لك
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6 flex-row-reverse">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {c._count.students} طالب
                </span>
              </div>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 flex-row-reverse">
                <div className="flex space-x-2 space-x-reverse">
                  <Link to={`/teacher/classes/${c.id}`} className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                    عرض التفاصيل
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
