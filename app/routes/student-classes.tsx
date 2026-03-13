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
  const { classes } = loaderData as {
    classes: { id: string; name: string; description: string | null; teacher: { name: string }; _count: { students: number } }[];
  };

  return (
    <div className="text-right">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">الفصول الدراسية</h2>
        <p className="text-slate-500 mt-2 text-lg">الفصول التي تنتمي إليها.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد فصول</h3>
          <p className="text-slate-500">لست مضافاً في أي فصول دراسية بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-md hover:border-emerald-300 transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-1">{c.name}</h3>
              {c.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{c.description}</p>}
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm flex-row-reverse">
                <div className="flex items-center text-slate-500 flex-row-reverse gap-1">
                  <span className="font-bold">{c.teacher.name || "معلم"}</span>
                  <span>(المعلم)</span>
                </div>
                <div className="flex items-center text-slate-500 font-bold flex-row-reverse gap-1">
                  <span>{c._count.students}</span>
                  <span>طالب</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
