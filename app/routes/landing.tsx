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
        bg: "bg-white",
        border: "border-slate-200",
        badge: "bg-slate-100 text-slate-700",
        btn: "bg-slate-800 hover:bg-slate-900",
    },
    BASIC: {
        bg: "bg-secondary-50/60",
        border: "border-secondary-200/80",
        badge: "bg-secondary-100 text-secondary-800",
        btn: "bg-secondary-600 hover:bg-secondary-700",
    },
    PRO: {
        bg: "bg-primary-50/70",
        border: "border-primary-200",
        badge: "bg-primary-100 text-primary-800",
        btn: "bg-primary-600 hover:bg-primary-700",
    },
    PREMIUM: {
        bg: "bg-warning-50/70",
        border: "border-warning-200",
        badge: "bg-warning-100 text-warning-800",
        btn: "bg-warning-600 hover:bg-warning-700",
    },
};

function PricingCard({
    plan,
}: {
    plan: PlanInfo;
}) {
    const colors = tierColors[plan.tier] || tierColors.FREE_TRIAL;
    const l = plan.limits;

    return (
        <div
            className={`rounded-3xl border ${colors.border} ${colors.bg} p-8 flex flex-col transition-colors shadow-xs`}
        >
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
                className={`block text-center py-3 px-6 rounded-xl text-white font-bold transition-colors ${colors.btn}`}
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

    const comparisonRows = [
        {
            key: "price",
            label: "السعر الشهري",
            getValue: (plan: PlanInfo) =>
                plan.priceMonthly === 0 ? "مجاناً" : `${plan.priceMonthly} ج.م`,
        },
        {
            key: "students",
            label: "إجمالي الطلاب",
            getValue: (plan: PlanInfo) =>
                plan.limits.maxTotalStudents
                    ? `حتى ${plan.limits.maxTotalStudents}`
                    : "غير محدود",
        },
        {
            key: "quizzes",
            label: "عدد الامتحانات",
            getValue: (plan: PlanInfo) =>
                plan.limits.maxQuizzes
                    ? `${plan.limits.maxQuizzes} كويز`
                    : "غير محدود",
        },
        {
            key: "questionBank",
            label: "بنك الأسئلة",
            getValue: (plan: PlanInfo) => (plan.limits.questionBank ? "متاح" : "غير متاح"),
        },
        {
            key: "leaderboard",
            label: "لوحة الشرف",
            getValue: (plan: PlanInfo) => (plan.limits.leaderboard ? "متاح" : "غير متاح"),
        },
        {
            key: "antiCheat",
            label: "منع الغش",
            getValue: (plan: PlanInfo) => antiCheatLabels[plan.limits.antiCheat] || plan.limits.antiCheat,
        },
        {
            key: "whatsapp",
            label: "رسائل واتساب",
            getValue: (plan: PlanInfo) => whatsappLabels[plan.limits.whatsapp] || plan.limits.whatsapp,
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm animate-reveal-down">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 sm:h-10 sm:w-10">
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
                            className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
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
                            className="block w-full rounded-2xl bg-primary-600 py-4 text-center font-bold text-white"
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
                            <div className="mb-8 inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-700 sm:text-xs">
                                منصة اختبارات مصممة للمعلمين في مصر
                            </div>
                            <h1 className="mb-8 text-4xl font-black leading-[1.15] text-slate-900 sm:text-6xl md:text-[4.25rem]">
                                أنشئ اختباراتك
                                <br />
                                <span className="text-primary-700">
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
                                    className="w-full rounded-2xl bg-primary-600 px-10 py-5 text-lg font-black text-white transition-colors hover:bg-primary-700 sm:w-auto sm:text-xl"
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
                                    className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-10 py-5 text-lg font-black text-slate-700 transition-colors hover:border-primary-200 hover:text-primary-700 sm:w-auto sm:text-xl"
                                >
                                    شاهد الباقات
                                </button>
                            </div>
                        </section>

                        <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16 opacity-0 animate-reveal-up delay-500">
                            <div className="rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-primary-700 p-8 sm:p-12 text-center text-white">
                                <h2 className="text-2xl sm:text-3xl font-black mb-8">
                                    أرقام تتحدث عنا
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {[
                                        { num: "10K+", label: "معلم يستخدمنا" },
                                        { num: "500K+", label: "طالب لأداء الاختبارات" },
                                        { num: "2M+", label: "اختبار تم إنشاؤه" },
                                        { num: "99.9%", label: "وقت التشغيل" },
                                    ].map((stat, i) => (
                                        <div key={i} className="text-center">
                                            <div className="text-3xl sm:text-4xl font-black mb-1">{stat.num}</div>
                                            <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24 opacity-0 animate-reveal-up delay-400">
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 text-center mb-16">
                                لماذا Quizaty؟
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {[
                                    {
                                        icon: (
                                            <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        ),
                                        title: "سريع وسهل",
                                        desc: "أنشئ اختبارك في دقائق معدودة بواجهة بسيطة وبديهية.",
                                    },
                                    {
                                        icon: (
                                            <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ),
                                        title: "تصحيح تلقائي",
                                        desc: "النتائج جاهزة فوراً بعد التقديم مع تحليل شامل للأداء.",
                                    },
                                    {
                                        icon: (
                                            <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        ),
                                        title: "حماية من الغش",
                                        desc: "أنظمة متقدمة لمنع الغش وضمان نزاهة الاختبارات.",
                                    },
                                ].map((f, i) => (
                                    <div
                                        key={i}
                                        className="rounded-3xl border border-slate-200 bg-white p-8 text-center transition-all hover:border-primary-200 hover:shadow-lg cursor-default"
                                    >
                                        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                                            {f.icon}
                                        </div>
                                        <h3 className="mb-3 text-xl font-black text-slate-900">
                                            {f.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16 opacity-0 animate-reveal-up delay-500">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-4">
                                لمن؟
                            </h2>
                            <p className="text-slate-500 text-center max-w-xl mx-auto mb-12">
                                Quizaty مصممة خصيصاً للمعلمين والطلاب في مصر
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                {[
                                    { emoji: "👨‍🏫", text: "معلمو المرحلة الابتدائية والإعدادية والثانوية" },
                                    { emoji: "👩‍🏫", text: "معلمو الجامعات والمعاهد الخاصة" },
                                    { emoji: "📚", text: "معاهد اللغات ومراكز التدريب" },
                                    { emoji: "🏫", text: "مدارس الحكومية والخاصة" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 text-right">
                                        <span className="text-3xl">{item.emoji}</span>
                                        <span className="font-bold text-slate-700">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="max-w-6xl mx-auto px-6 py-12 opacity-0 animate-reveal-up delay-500">
                            <div className="rounded-[2.5rem] border border-slate-200 bg-slate-100 p-10 text-center sm:p-16">
                                <h2 className="mb-6 text-3xl font-black text-slate-900 sm:text-5xl">
                                    جاهز للبدء؟
                                </h2>
                                <p className="mx-auto mb-12 max-w-xl text-lg font-medium text-slate-600 sm:text-xl">
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
                                    className="cursor-pointer rounded-2xl bg-primary-600 px-12 py-5 text-lg font-black text-white transition-colors hover:bg-primary-700 sm:text-xl"
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
                                className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-6 py-2 text-sm font-bold text-primary-700 transition-colors hover:text-slate-900"
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

                        <div className="mt-20 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
                            <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="text-2xl font-black text-slate-900">
                                    مقارنة تفصيلية
                                </h3>
                            </div>
                            <div className="space-y-4 p-4 sm:p-6 lg:hidden">
                                {plans.map((plan) => (
                                    <div key={plan.tier} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
                                        <div className="mb-4 flex items-center justify-between gap-3 flex-row-reverse">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900">{plan.nameAr}</h4>
                                                <p className="text-sm font-medium text-slate-500">{plan.nameEn}</p>
                                            </div>
                                            <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-primary-600 border border-primary-100">
                                                {plan.priceMonthly === 0 ? "مجاناً" : `${plan.priceMonthly} ج.م`}
                                            </span>
                                        </div>
                                        <dl className="space-y-3">
                                            {comparisonRows.map((row) => (
                                                <div key={row.key} className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3 flex-row-reverse">
                                                    <dt className="text-sm font-bold text-slate-700">{row.label}</dt>
                                                    <dd className="text-sm font-medium text-slate-600 text-left">{row.getValue(plan)}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                ))}
                            </div>
<div className="overflow-x-auto">
                                <table className="w-full text-right min-w-[600px]">
                                    <caption className="sr-only">
                                        جدول مقارنة يوضح الفروق بين الباقات من حيث السعر الشهري وعدد الطلاب والاختبارات والمزايا المتاحة.
                                    </caption>
                                    <thead>
                                        <tr className="bg-slate-100/50 text-slate-500 font-black text-xs uppercase tracking-wider">
                                            <th scope="col" className="px-8 py-6">
                                                المميزات
                                            </th>
                                            {plans.map((p) => (
                                                <th
                                                    key={p.tier}
                                                    scope="col"
                                                    className="text-center px-4 py-6"
                                                >
                                                    {p.nameAr}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <th scope="row" className="px-8 py-6 font-bold text-slate-900">
                                                السعر الشهري
                                            </th>
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
                                            <th scope="row" className="px-8 py-6 font-bold text-slate-700">
                                                إجمالي الطلاب
                                            </th>
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
                                            <th scope="row" className="px-8 py-6 font-bold text-slate-700">
                                                عدد الامتحانات
                                            </th>
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
                                            <th scope="row" className="px-8 py-6 font-bold text-slate-700">
                                                بنك الأسئلة
                                            </th>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6"
                                                >
                                                    {p.limits.questionBank ? (
                                                        <span className="text-success-500 text-xl">
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
                                            <th scope="row" className="px-8 py-6 font-bold text-slate-700">
                                                لوحة الشرف
                                            </th>
                                            {plans.map((p) => (
                                                <td
                                                    key={p.tier}
                                                    className="text-center px-4 py-6"
                                                >
                                                    {p.limits.leaderboard ? (
                                                        <span className="text-success-500 text-xl">
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
                                            <th scope="row" className="px-8 py-6 font-bold text-slate-700">
                                                منع الغش
                                            </th>
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
                                            <th scope="row" className="px-8 py-6 font-bold text-slate-700">
                                                رسائل واتساب
                                            </th>
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
