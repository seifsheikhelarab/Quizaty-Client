import { Link, redirect } from "react-router";
import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export function meta() {
    return [
        { title: "Quizaty | منصة الاختبارات الذكية" },
        {
            name: "description",
            content: "منصة Quizaty لإنشاء وإدارة الاختبارات الإلكترونية",
        },
    ];
}

export async function clientLoader() {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7492/api";
    
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.user.role === "teacher" || data.user.isAssistant) {
                throw redirect("/teacher/dashboard");
            } else if (data.user.role === "student") {
                throw redirect("/student/dashboard");
            }
        }
    } catch (e) {
        if (e instanceof Response) throw e;
        // Not logged in, stay on landing
    }
    return null;
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

const tierColors: Record<
    string,
    { bg: string; border: string; badge: string; btn: string }
> = {
    FREE_TRIAL: {
        bg: "bg-slate-50",
        border: "border-slate-200",
        badge: "bg-slate-100 text-slate-700",
        btn: "bg-slate-700 hover:bg-slate-800",
    },
    BASIC: {
        bg: "bg-sky-50",
        border: "border-sky-200",
        badge: "bg-sky-100 text-sky-700",
        btn: "bg-sky-600 hover:bg-sky-700",
    },
    PRO: {
        bg: "bg-primary-50",
        border: "border-primary-300",
        badge: "bg-primary-100 text-primary-700",
        btn: "bg-primary-600 hover:bg-primary-700",
    },
    PREMIUM: {
        bg: "bg-amber-50",
        border: "border-amber-300",
        badge: "bg-amber-100 text-amber-700",
        btn: "bg-amber-600 hover:bg-amber-700",
    },
};

function PricingCard({
    plan,
    featured,
}: {
    plan: PlanInfo;
    featured?: boolean;
}) {
    const colors = tierColors[plan.tier] || tierColors.FREE_TRIAL;
    const l = plan.limits;

    return (
        <div
            className={`relative rounded-3xl border-2 ${colors.border} ${colors.bg} p-8 flex flex-col transition-transform hover:scale-[1.02] ${featured ? "shadow-2xl ring-2 ring-primary-400 ring-offset-2" : "shadow-md"}`}
        >
                {featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                        ⭐ الأكثر شعبية
                    </div>
                )}
            <div className="text-center mb-6">
                <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${colors.badge} mb-3`}
                >
                    {plan.nameEn}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                    {plan.nameAr}
                </h3>
                <div className="mt-4">
                    <span className="text-4xl font-black text-slate-900">
                        {plan.priceMonthly === 0
                            ? "مجاناً"
                            : `${plan.priceMonthly}`}
                    </span>
                    {plan.priceMonthly > 0 && (
                        <span className="text-sm text-slate-500 font-bold mr-1">
                            ج.م / شهر
                        </span>
                    )}
                </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8 text-sm">
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-primary-600 font-bold">👥</span>
                    <span className="text-slate-700 font-medium">
                        {l.maxTotalStudents
                            ? `حتى ${l.maxTotalStudents} طالب`
                            : "طلاب غير محدود"}
                    </span>
                </li>
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-primary-600 font-bold">📝</span>
                    <span className="text-slate-700 font-medium">
                        {l.maxQuizzes
                            ? `${l.maxQuizzes} كويز فقط`
                            : "اختبارات غير محدودة"}
                    </span>
                </li>
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span>{l.autoGrading ? "✅" : "❌"}</span>
                    <span className="text-slate-700 font-medium">
                        التصحيح التلقائي
                    </span>
                </li>
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span>📊</span>
                    <span className="text-slate-700 font-medium">
                        {reportLabels[l.reports] || l.reports}
                    </span>
                </li>
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span>{l.questionBank ? "✅" : "❌"}</span>
                    <span className="text-slate-700 font-medium">
                        بنك الأسئلة
                    </span>
                </li>
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span>{l.leaderboard ? "✅" : "❌"}</span>
                    <span className="text-slate-700 font-medium">
                        لوحة الشرف
                    </span>
                </li>
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span>🔒</span>
                    <span className="text-slate-700 font-medium">
                        {antiCheatLabels[l.antiCheat] || l.antiCheat}
                    </span>
                </li>
                <li className="flex items-center gap-2 flex-row-reverse">
                    <span>💬</span>
                    <span className="text-slate-700 font-medium">
                        {whatsappLabels[l.whatsapp] || l.whatsapp}
                    </span>
                </li>
                {l.assistants > 0 && (
                    <li className="flex items-center gap-2 flex-row-reverse">
                        <span>👤</span>
                        <span className="text-slate-700 font-medium">
                            حتى {l.assistants} مساعدين
                        </span>
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        apiFetch("/plans")
            .then((data) => setPlans(data.plans))
            .catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 animate-reveal-down">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 14l9-5-9-5-9 5 9 5z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                            Quizaty
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => {
                                setActiveTab("pricing");
                                setTimeout(
                                    () =>
                                        document
                                            .getElementById("pricing")
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            }),
                                    0,
                                );
                            }}
                            className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors cursor-pointer"
                        >
                            الأسعار
                        </button>
                        <Link
                            to="/login"
                            className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors"
                        >
                            تسجيل الدخول
                        </Link>
                        <Link
                            to="/register"
                            className="bg-primary-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-primary-200 animate-glow"
                        >
                            ابدأ مجاناً
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-500 hover:text-primary-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white p-6 space-y-4 animate-in slide-in-from-top duration-300">
                        <button
                            onClick={() => {
                                setActiveTab("pricing");
                                setIsMobileMenuOpen(false);
                            }}
                            className="block w-full text-right text-lg font-bold text-slate-700 hover:text-primary-600"
                        >
                            الباقات والأسعار
                        </button>
                        <Link
                            to="/login"
                            className="block w-full text-right text-lg font-bold text-slate-700 hover:text-primary-600"
                        >
                            تسجيل الدخول
                        </Link>
                        <Link
                            to="/register"
                            className="block w-full bg-primary-600 text-white text-center font-bold py-4 rounded-2xl shadow-lg shadow-primary-200"
                        >
                            ابدأ مجاناً الآن
                        </Link>
                    </div>
                )}
            </nav>

            <div className="pt-8 sm:pt-16 pb-20 mt-16 sm:mt-0">
                {activeTab === "hero" ? (
                    <>
                        <section className="max-w-6xl mx-auto px-6 text-center pt-10 sm:pt-20 opacity-0 animate-reveal-up">
                            <div className="inline-block bg-primary-50 text-primary-700 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 border border-primary-100/50 animate-float">
                                🚀 منصة الاختبارات الذكية الأولى في مصر
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
                                أنشئ اختباراتك
                                <br />
                                <span className="bg-linear-to-l from-primary-600 to-cyan-500 bg-clip-text text-transparent">
                                    بذكاء واحترافية
                                </span>
                            </h1>
                            <p className="text-base sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 px-2 leading-relaxed opacity-0 animate-reveal-up delay-200">
                                منصة Quizaty تتيح لك إنشاء اختبارات إلكترونية
                                تفاعلية بسهولة، مع تصحيح تلقائي وتقارير ذكية
                                ترفع مستوى طلابك.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 opacity-0 animate-reveal-up delay-300">
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto bg-primary-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 text-lg sm:text-xl active:scale-95 animate-glow"
                                >
                                    انضم إلينا مجاناً
                                </Link>
                                <button
                                    onClick={() => {
                                        setActiveTab("pricing");
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        });
                                    }}
                                    className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 font-black px-10 py-5 rounded-2xl hover:border-primary-300 hover:text-primary-600 transition-all text-lg sm:text-xl cursor-pointer hover:shadow-lg active:scale-95"
                                >
                                    شاهد الباقات
                                </button>
                            </div>
                        </section>

                        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24 opacity-0 animate-reveal-up delay-400">
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 text-center mb-16">
                                لماذا Quizaty؟
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: "⚡",
                                        title: "سريع وسهل",
                                        desc: "أنشئ اختبارك في دقائق معدودة بواجهة بسيطة وبديهية.",
                                    },
                                    {
                                        icon: "✅",
                                        title: "تصحيح تلقائي",
                                        desc: "النتائج جاهزة فوراً بعد التقديم مع تحليل شامل للأداء.",
                                    },
                                    {
                                        icon: "🔒",
                                        title: "حماية من الغش",
                                        desc: "أنظمة متقدمة لمنع الغش وضمان نزاهة الاختبارات.",
                                    },
                                ].map((f, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-3xl border border-slate-100 p-10 hover:shadow-2xl hover:shadow-primary-100 transition-all text-center group cursor-default"
                                    >
                                        <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform inline-block">
                                            {f.icon}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                                            {f.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="max-w-6xl mx-auto px-6 py-12 opacity-0 animate-reveal-up delay-500">
                            <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-20 text-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-full bg-primary-600/10 group-hover:bg-primary-600/20 transition-colors" />
                                <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 relative">
                                    جاهز للبدء؟
                                </h2>
                                <p className="text-slate-400 text-lg sm:text-xl font-medium mb-12 relative max-w-xl mx-auto">
                                    اختر الباقة المناسبة لك وابدأ في إنشاء
                                    اختباراتك اليوم.
                                </p>
                                <button
                                    onClick={() => {
                                        setActiveTab("pricing");
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        });
                                    }}
                                    className="bg-white text-slate-900 font-black px-12 py-5 rounded-2xl hover:bg-primary-50 transition-colors text-lg sm:text-xl shadow-xl relative cursor-pointer active:scale-95"
                                >
                                    عرض الباقات والأسعار
                                </button>
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="max-w-6xl mx-auto px-6 py-10 sm:py-16 opacity-0 animate-reveal-up">
                        <div
                            id="pricing"
                            className="text-center mb-16 scroll-mt-24 px-4"
                        >
                            <button
                                onClick={() => setActiveTab("hero")}
                                className="text-sm font-black text-primary-600 hover:text-slate-900 mb-6 inline-flex items-center gap-2 px-6 py-2 bg-primary-50 rounded-full transition-all cursor-pointer"
                            >
                                <svg
                                    className="w-4 h-4 rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                                <span>العودة للرئيسية</span>
                            </button>
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                                الباقات والأسعار
                            </h2>
                            <p className="text-slate-500 font-medium text-base sm:text-xl">
                                اختر الباقة المثالية لرحلتك التعليمية
                            </p>
                        </div>

                        <div className="mb-20">
                            {plans.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {plans.map((plan) => (
                                        <PricingCard
                                            key={plan.tier}
                                            plan={plan}
                                            featured={plan.tier === "PRO"}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">
                                        جاري تحميل الباقات...
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-20 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-100">
                            <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="text-2xl font-black text-slate-900">
                                    مقارنة تفصيلية
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-100/50 text-slate-500 font-black text-xs uppercase tracking-wider">
                                            <th className="px-8 py-6">
                                                المميزات
                                            </th>
                                            {plans.map((p) => (
                                                <th
                                                    key={p.tier}
                                                    className="text-center px-4 py-6"
                                                >
                                                    {p.nameAr}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-slate-900">
                                                السعر الشهري
                                            </td>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6 font-black text-primary-600"
                                                >
                                                    {p.priceMonthly === 0
                                                        ? "مجاناً"
                                                        : `${p.priceMonthly} ج.م`}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-slate-700">
                                                إجمالي الطلاب
                                            </td>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6 text-slate-600 font-medium"
                                                >
                                                    {p.limits.maxTotalStudents
                                                        ? `حتى ${p.limits.maxTotalStudents}`
                                                        : "غير محدود"}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-slate-700">
                                                عدد الامتحانات
                                            </td>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6 text-slate-600 font-medium"
                                                >
                                                    {p.limits.maxQuizzes
                                                        ? `${p.limits.maxQuizzes} كويز`
                                                        : "غير محدود"}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-slate-700">
                                                بنك الأسئلة
                                            </td>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6"
                                                >
                                                    {p.limits.questionBank ? (
                                                        <span className="text-emerald-500 text-xl">
                                                            ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">
                                                            ✕
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-slate-700">
                                                لوحة الشرف
                                            </td>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6"
                                                >
                                                    {p.limits.leaderboard ? (
                                                        <span className="text-emerald-500 text-xl">
                                                            ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">
                                                            ✕
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-slate-700">
                                                منع الغش
                                            </td>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6 text-slate-600 font-medium whitespace-nowrap"
                                                >
                                                    {
                                                        antiCheatLabels[
                                                            p.limits.antiCheat
                                                        ]
                                                    }
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6 font-bold text-slate-700">
                                                رسائل واتساب
                                            </td>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6 text-slate-600 font-medium"
                                                >
                                                    {
                                                        whatsappLabels[
                                                            p.limits.whatsapp
                                                        ]
                                                    }
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <footer className="border-t border-slate-100 bg-white relative z-10">
                <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 14l9-5-9-5-9 5 9 5z"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                            Quizaty
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 font-bold">
                        © 2026 Quizaty. جميع الحقوق محفوظة.
                    </p>
                </div>
            </footer>
        </div>
    );
}
