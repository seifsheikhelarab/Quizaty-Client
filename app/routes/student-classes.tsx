import { useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-classes";

export function meta() {
  return [{ title: "فصولي | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/student/classes");
  return data;
}

export default function StudentClasses({ loaderData }: Route.ComponentProps) {
  const data = loaderData as {
    classes?: { id: string; name: string; description: string | null; teacher: { name: string }; _count: { students: number } }[];
  };
  const classes = data?.classes || [];
  const [search, setSearch] = useState("");

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-right">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">الفصول الدراسية</h2>
        <p className="text-slate-500 mt-2 text-lg">الفصول التي تنتمي إليها.</p>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="ابحث باسم الفصل أو المعلم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
          <p className="text-slate-500">جرب البحث بعبارة مختلفة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => (
            <Link key={c.id} to={`/student/classes/${c.id}`} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-md hover:border-emerald-300 transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-1">{c.name}</h3>
              {c.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{c.description}</p>}
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm flex-row-reverse">
                <div className="flex items-center text-slate-500 flex-row-reverse gap-1">
                  <span className="font-bold">{c.teacher?.name || "معلم"}</span>
                  <span>(المعلم)</span>
                </div>
                <div className="flex items-center text-slate-500 font-bold flex-row-reverse gap-1">
                  <span>{c._count?.students || 0}</span>
                  <span>طالب</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
