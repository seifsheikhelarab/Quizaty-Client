import { Link } from "react-router";
import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export function meta() {
  return [
    { title: "Quizaty | منصة الاختبارات الذكية" },
    { name: "description", content: "منصة Quizaty لإنشاء وإدارة الاختبارات الإلكترونية" },
  ];
}

interface PlanInfo {
  tier: string;
  nameAr: string;
  nameEn: string;
  priceMonthly: number;
  limits: {
    maxTotalStudents: number | null;
    maxQuizzes: number | null;
    autoGrading: boolean;
    reports: string;
    questionBank: boolean;
    leaderboard: boolean;
    antiCheat: string;
    whatsapp: string;
    assistants: number;
  };
}

const reportLabels: Record<string, string> = {
  basic: "✅ أساسية",
  excel: "✅ Excel مفصل",
  full: "✅ تحليل أداء كامل",
  comprehensive: "✅ تحليل أداء شامل",
};

const antiCheatLabels: Record<string, string> = {
  basic: "❌ قفل بسيط",
  medium: "✅ تأمين متوسط",
  advanced: "✅ تأمين متقدم",
  max: "✅ أعلى حماية + Watermark",
};

const whatsappLabels: Record<string, string> = {
  none: "❌ غير متاح",
  paid: "✅ (رسوم إضافية)",
  included: "✅ شاملة (بحد أقصى)",
};

const tierColors: Record<string, { bg: string; border: string; badge: string; btn: string }> = {
  FREE_TRIAL: { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-700", btn: "bg-slate-700 hover:bg-slate-800" },
  BASIC: { bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-100 text-sky-700", btn: "bg-sky-600 hover:bg-sky-700" },
  PRO: { bg: "bg-indigo-50", border: "border-indigo-300", badge: "bg-indigo-100 text-indigo-700", btn: "bg-indigo-600 hover:bg-indigo-700" },
  PREMIUM: { bg: "bg-amber-50", border: "border-amber-300", badge: "bg-amber-100 text-amber-700", btn: "bg-amber-600 hover:bg-amber-700" },
};

function PricingCard({ plan, featured }: { plan: PlanInfo; featured?: boolean }) {
  const colors = tierColors[plan.tier] || tierColors.FREE_TRIAL;
  const l = plan.limits;

  return (
    <div className={`relative rounded-3xl border-2 ${colors.border} ${colors.bg} p-8 flex flex-col transition-transform hover:scale-[1.02] ${featured ? "shadow-2xl ring-2 ring-indigo-400 ring-offset-2" : "shadow-md"}`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
          ⭐ الأكثر شعبية
        </div>
      )}
      <div className="text-center mb-6">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${colors.badge} mb-3`}>{plan.nameEn}</span>
        <h3 className="text-xl font-black text-slate-900">{plan.nameAr}</h3>
        <div className="mt-4">
          <span className="text-4xl font-black text-slate-900">
            {plan.priceMonthly === 0 ? "مجاناً" : `${plan.priceMonthly}`}
          </span>
          {plan.priceMonthly > 0 && <span className="text-sm text-slate-500 font-bold mr-1">ج.م / شهر</span>}
        </div>
      </div>

      <ul className="space-y-3 flex-1 mb-8 text-sm">
        <li className="flex items-center gap-2 flex-row-reverse">
          <span className="text-indigo-600 font-bold">👥</span>
          <span className="text-slate-700 font-medium">
            {l.maxTotalStudents ? `حتى ${l.maxTotalStudents} طالب` : "طلاب غير محدود"}
          </span>
        </li>
        <li className="flex items-center gap-2 flex-row-reverse">
          <span className="text-indigo-600 font-bold">📝</span>
          <span className="text-slate-700 font-medium">
            {l.maxQuizzes ? `${l.maxQuizzes} كويز فقط` : "اختبارات غير محدودة"}
          </span>
        </li>
        <li className="flex items-center gap-2 flex-row-reverse">
          <span>{l.autoGrading ? "✅" : "❌"}</span>
          <span className="text-slate-700 font-medium">التصحيح التلقائي</span>
        </li>
        <li className="flex items-center gap-2 flex-row-reverse">
          <span>📊</span>
          <span className="text-slate-700 font-medium">{reportLabels[l.reports] || l.reports}</span>
        </li>
        <li className="flex items-center gap-2 flex-row-reverse">
          <span>{l.questionBank ? "✅" : "❌"}</span>
          <span className="text-slate-700 font-medium">بنك الأسئلة</span>
        </li>
        <li className="flex items-center gap-2 flex-row-reverse">
          <span>{l.leaderboard ? "✅" : "❌"}</span>
          <span className="text-slate-700 font-medium">لوحة الشرف</span>
        </li>
        <li className="flex items-center gap-2 flex-row-reverse">
          <span>🔒</span>
          <span className="text-slate-700 font-medium">{antiCheatLabels[l.antiCheat] || l.antiCheat}</span>
        </li>
        <li className="flex items-center gap-2 flex-row-reverse">
          <span>💬</span>
          <span className="text-slate-700 font-medium">{whatsappLabels[l.whatsapp] || l.whatsapp}</span>
        </li>
        {l.assistants > 0 && (
          <li className="flex items-center gap-2 flex-row-reverse">
            <span>👤</span>
            <span className="text-slate-700 font-medium">حتى {l.assistants} مساعدين</span>
          </li>
        )}
      </ul>

      <Link
        to="/register"
        className={`block text-center py-3 px-6 rounded-xl text-white font-bold shadow-sm transition-colors ${colors.btn}`}
      >
        {plan.priceMonthly === 0 ? "ابدأ مجاناً" : "اشترك الآن"}
      </Link>
    </div>
  );
}

export default function LandingPage() {
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"hero" | "pricing">("hero");

  useEffect(() => {
    apiFetch("/plans").then((data) => setPlans(data.plans)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-xl font-black text-slate-900">Quizaty</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("pricing")}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              الأسعار
            </button>
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {activeTab === "hero" && (
        <>
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              🚀 منصة الاختبارات الذكية الأولى في مصر
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
              أنشئ اختباراتك
              <br />
              <span className="bg-gradient-to-l from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                بذكاء وسهولة
              </span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10">
              منصة Quizaty تتيح لك إنشاء اختبارات إلكترونية بسهولة، مع تصحيح تلقائي فوري وتقارير
              مفصلة لأداء الطلاب.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 text-lg"
              >
                ابدأ مجاناً الآن
              </Link>
              <button
                onClick={() => setActiveTab("pricing")}
                className="bg-white border-2 border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all text-lg cursor-pointer"
              >
                شاهد الباقات
              </button>
            </div>
          </section>

          {/* Features */}
          <section className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-12">لماذا Quizaty؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "⚡", title: "سريع وسهل", desc: "أنشئ اختبارك في دقائق معدودة بواجهة بسيطة وبديهية." },
                { icon: "✅", title: "تصحيح تلقائي", desc: "النتائج جاهزة فوراً بعد التقديم مع تحليل شامل للأداء." },
                { icon: "🔒", title: "حماية من الغش", desc: "أنظمة متقدمة لمنع الغش وضمان نزاهة الاختبارات." },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-shadow text-center">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 font-medium text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA to pricing */}
          <section className="max-w-6xl mx-auto px-6 py-16 text-center">
            <div className="bg-gradient-to-l from-indigo-600 to-violet-600 rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-black mb-4">جاهز للبدء؟</h2>
              <p className="text-indigo-100 font-medium mb-8">اختر الباقة المناسبة لك وابدأ في إنشاء اختباراتك اليوم.</p>
              <button
                onClick={() => setActiveTab("pricing")}
                className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-colors text-lg shadow-lg cursor-pointer"
              >
                عرض الباقات والأسعار
              </button>
            </div>
          </section>
        </>
      )}

      {activeTab === "pricing" && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <button
              onClick={() => setActiveTab("hero")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              → العودة للرئيسية
            </button>
            <h2 className="text-4xl font-black text-slate-900 mb-4">الباقات والأسعار</h2>
            <p className="text-slate-500 font-medium text-lg">اختر الباقة المناسبة لاحتياجاتك</p>
          </div>

          {plans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <PricingCard key={plan.tier} plan={plan} featured={plan.tier === "PRO"} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">جاري تحميل الباقات...</div>
          )}

          {/* Comparison table */}
          <div className="mt-16 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">مقارنة تفصيلية</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold">
                    <th className="text-right px-6 py-4">المميزات</th>
                    {plans.map((p) => (
                      <th key={p.tier} className="text-center px-4 py-4">{p.nameAr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-700">السعر شهرياً</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="text-center px-4 py-4 font-bold text-slate-900">
                        {p.priceMonthly === 0 ? "مجاناً" : `${p.priceMonthly} ج.م`}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-700">إجمالي الطلاب</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="text-center px-4 py-4 text-slate-600">
                        {p.limits.maxTotalStudents ? `حتى ${p.limits.maxTotalStudents}` : "غير محدود"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-700">عدد الامتحانات</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="text-center px-4 py-4 text-slate-600">
                        {p.limits.maxQuizzes ? `${p.limits.maxQuizzes} كويز` : "غير محدود"}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-700">بنك الأسئلة</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="text-center px-4 py-4">
                        {p.limits.questionBank ? "✅" : "❌"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-700">لوحة الشرف</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="text-center px-4 py-4">
                        {p.limits.leaderboard ? "✅" : "❌"}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-700">منع الغش</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="text-center px-4 py-4 text-slate-600">
                        {antiCheatLabels[p.limits.antiCheat]}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-700">رسائل واتساب</td>
                    {plans.map((p) => (
                      <td key={p.tier} className="text-center px-4 py-4 text-slate-600">
                        {whatsappLabels[p.limits.whatsapp]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-slate-400 font-medium">© 2026 Quizaty. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
