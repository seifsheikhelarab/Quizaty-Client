import { Link } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-subscription";

export function meta() {
  return [{ title: "الاشتراكات | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/teacher/dashboard");
  return data;
}

export default function TeacherSubscription({ loaderData }: Route.ComponentProps) {
  const { subscription, limits, planInfo, usage } = loaderData as any;
  
  const tiers = [
    {
      id: "FREE_TRIAL",
      name: "باقة التجربة",
      price: "مجاناً",
      features: ["حتى 50 طالب", "2 اختبار فقط", "تصحيح تلقائي"],
      notFeatures: ["بنك الأسئلة", "لوحة المشرف", "حماية متقدمة", "واتساب", "مساعدين"],
      current: subscription?.tier === "FREE_TRIAL" || !subscription,
    },
    {
      id: "BASIC",
      name: "باقة المبتدئ",
      price: "199 ج.م",
      features: ["حتى 100 طالب", "اختبارات غير محدودة", "تصحيح تلقائي", "لوحة المشرف", "حماية متوسطة"],
      notFeatures: ["بنك الأسئلة", "واتساب", "مساعدين"],
      current: subscription?.tier === "BASIC",
    },
    {
      id: "PRO",
      name: "باقة المجموعات",
      price: "399 ج.م",
      features: ["حتى 200 طالب", "اختبارات غير محدودة", "تصحيح تلقائي", "لوحة المشرف", "بنك الأسئلة", "حماية متقدمة", "واتساب (مدفوع)"],
      notFeatures: ["مساعدين"],
      current: subscription?.tier === "PRO",
    },
    {
      id: "PREMIUM",
      name: "باقة النخبة",
      price: "699 ج.م",
      features: ["حتى 600 طالب", "اختبارات غير محدودة", "تصحيح تلقائي", "لوحة المشرف", "بنك أسئلة ذكي", "أعلى حماية + Watermark", "واتساب (مُضمن)", "حتى 2 مساعدين"],
      notFeatures: [],
      current: subscription?.tier === "PREMIUM",
    },
  ];

  return (
    <div className="text-right">
      <div className="mb-8 pb-6 border-b border-slate-200">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">الاشتراكات</h2>
        <p className="text-slate-500 mt-2">اختر الباقة المناسبة لاحتياجاتك</p>
      </div>

      {/* Current Plan */}
      {subscription && (
        <div className="rounded-[2rem] border border-primary-200/70 bg-linear-to-l from-secondary-600 via-primary-600 to-primary-700 p-6 mb-8 text-white shadow-xl shadow-primary-200/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-primary-200 text-sm font-medium">خطتك الحالية</p>
              <h3 className="text-2xl font-black">{planInfo?.nameAr || subscription.tier}</h3>
              {subscription.expiresAt && (
                <p className="text-primary-200 text-sm mt-1">
                  تنتهي في: {new Date(subscription.expiresAt).toLocaleDateString("ar-EG")}
                </p>
              )}
            </div>
            <div className="text-left">
              <p className="text-primary-200 text-sm">الطلاب</p>
              <p className="text-xl font-bold">
                {usage?.students?.current || 0} / {usage?.students?.max === null ? "غير محدود" : usage?.students?.max || 50}
              </p>
              <div className="w-32 h-2 bg-primary-500 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.min(((usage?.students?.current || 0) / (usage?.students?.max || 50)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`bg-white rounded-2xl border-2 p-6 ${
              tier.current ? "border-primary-500 shadow-lg shadow-primary-100" : "border-slate-200"
            }`}
          >
            {tier.current && (
              <span className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                خطتك الحالية
              </span>
            )}
            <h3 className="text-xl font-black text-slate-900">{tier.name}</h3>
            <p className="text-3xl font-black text-primary-600 mt-2">{tier.price}</p>
            <p className="text-slate-500 text-sm mt-1">/ شهر</p>

            <ul className="mt-6 space-y-3">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-slate-600 flex-row-reverse">
                  <svg className="w-5 h-5 text-success-500 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
              {tier.notFeatures.map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-slate-400 flex-row-reverse">
                  <svg className="w-5 h-5 text-slate-300 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled={tier.current}
              className={`w-full mt-6 py-3 rounded-xl font-bold transition-all ${
                tier.current
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {tier.current ? "الباقة الحالية" : "الترقية لهذه الباقة"}
            </button>
          </div>
        ))}
      </div>

      {/* Usage Stats */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">استخدامك الحالي</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-black text-primary-600">{usage?.students?.current || 0}</p>
            <p className="text-sm text-slate-500 mt-1">الطلاب</p>
            <p className="text-xs text-slate-400 mt-1">الحد: {usage?.students?.max === null ? "غير محدود" : usage?.students?.max || 50}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-black text-secondary-600">{usage?.quizzes?.current || 0}</p>
            <p className="text-sm text-slate-500 mt-1">الاختبارات</p>
            <p className="text-xs text-slate-400 mt-1">الحد: {usage?.quizzes?.max === null ? "غير محدود" : usage?.quizzes?.max || 2}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-black text-primary-600">{limits?.questionBank ? "مُفعل" : "غير مُفعّل"}</p>
            <p className="text-sm text-slate-500 mt-1">بنك الأسئلة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
