import { useState } from "react";
import { apiFetch } from "../utils/api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FeedbackBanner } from "../components/FeedbackBanner";
import type { Route } from "./+types/teacher-assistants";

export function meta() {
  return [{ title: "إدارة المساعدين | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/teacher/assistants");
  const authData = await apiFetch("/auth/me");
  return { assistants: data.assistants, user: authData.user };
}

export default function TeacherAssistants({ loaderData }: Route.ComponentProps) {
  const { assistants, user } = loaderData;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [assistantToRemove, setAssistantToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isRemovingAssistant, setIsRemovingAssistant] = useState(false);

  const handleAddAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      await apiFetch("/teacher/assistants", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إضافة المساعد");
      setLoading(false);
    }
  };

  const handleRemoveAssistant = async () => {
    if (!assistantToRemove) return;
    setIsRemovingAssistant(true);
    setStatusMessage(null);
    try {
      await apiFetch(`/teacher/assistants/${assistantToRemove.id}`, { method: "DELETE" });
      window.location.reload();
    } catch (err: any) {
      setStatusMessage(err.message || "حدث خطأ أثناء حذف المساعد");
      setIsRemovingAssistant(false);
    }
  };

  if (user.isAssistant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-black text-danger-600 mb-4">عذراً، لا تمتلك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-slate-600">يمكن للمدرس الأساسي فقط إدارة حسابات المساعدين.</p>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className="mb-8 pb-6 border-b border-slate-200">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة المساعدين</h2>
        <p className="text-slate-500 mt-2 text-sm">أضف مساعدين لمساعدتك في إدارة المنصة، الفصول، والاختبارات.</p>
      </div>
      {statusMessage && (
        <FeedbackBanner
          tone="error"
          message={statusMessage}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">إضافة مساعد جديد</h3>
            {error && <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg">{error}</div>}
            <form onSubmit={handleAddAssistant} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الاسم</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-right focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="اسم المساعد"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-right focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="البريد الإلكتروني لتسجيل الدخول"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الرقم السري</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-right focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="كلمة مرور المساعد"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "جاري الإضافة..." : "إضافة حساب مساعد"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">قائمة المساعدين ({assistants.length})</h3>
            </div>
            {assistants.length === 0 ? (
              <div className="p-12 text-center text-slate-500 border-t border-slate-100">
                <p>لا يوجد مساعدين مضافين حالياً.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {assistants.map((assistant: any) => (
                  <div key={assistant.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg">
                        {assistant.name ? assistant.name[0].toUpperCase() : "A"}
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-slate-900">{assistant.name}</h4>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">{assistant.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAssistantToRemove({ id: assistant.id, name: assistant.name })}
                      className="px-3 py-1.5 text-xs font-bold text-danger-600 hover:bg-danger-50 border border-slate-200 hover:border-danger-200 rounded-lg transition-colors cursor-pointer"
                    >
                      حذف الحساب
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={assistantToRemove !== null}
        title="حذف حساب المساعد"
        description={
          assistantToRemove
            ? `سيتم حذف حساب المساعد "${assistantToRemove.name}" ولن يتمكن من تسجيل الدخول بعد الآن.`
            : ""
        }
        confirmLabel="حذف الحساب"
        busy={isRemovingAssistant}
        onCancel={() => {
          if (!isRemovingAssistant) setAssistantToRemove(null);
        }}
        onConfirm={handleRemoveAssistant}
      />
    </div>
  );
}
