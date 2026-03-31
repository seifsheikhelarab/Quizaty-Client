import { Link, useOutletContext } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-dashboard";
import { Suspense } from "react";
import { Spinner } from "../components/Spinner";

export function meta() {
  return [{ title: "لوحة التحكم | Quizaty" }];
}

export async function clientLoader() {
  const [data, questionsData, assistantsData] = await Promise.all([
    apiFetch("/teacher/dashboard"),
    apiFetch("/teacher/question-bank"),
    apiFetch("/teacher/assistants")
  ]);
  return { 
    ...data, 
    questionBankCount: questionsData.questions?.length || 0,
    assistantsCount: assistantsData.assistants?.length || 0
  };
}

interface StatsData {
  stats: {
    quizzes: number;
    students: number;
    submissions: number;
    classes: number;
  };
  subscription: { tier: string; expiresAt: string } | null;
  limits: Record<string, any>;
  planInfo: { nameAr: string; nameEn: string; priceMonthly: number };
  usage: {
    students: { current: number; max: number | null };
    quizzes: { current: number; max: number | null };
  };
  questionBankCount: number;
  assistantsCount: number;
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number | null }) {
  if (max === null) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-emerald-600 font-bold">{current} / غير محدود ✅</span>
      </div>
    );
  }
  const pct = Math.min((current / max) * 100, 100);
  const color = pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-bold text-slate-700">{label}</span>
        <span className={`font-bold ${pct >= 90 ? "text-rose-600" : "text-slate-600"}`}>
          {current} / {max}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function TeacherDashboard({ loaderData }: Route.ComponentProps) {
  const { stats, subscription, limits, planInfo, usage, questionBankCount = 0, assistantsCount = 0 } = loaderData as StatsData;
  const user = useOutletContext<any>();

  const showQuestionBank = limits.questionBank === true;
  const showAssistants = limits.assistants > 0 && !user?.isAssistant;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-reveal-up">
        <h2 className="text-2xl font-black text-slate-900">لوحة التحكم</h2>
        <p className="text-slate-500 font-medium mt-1">مرحباً بك! إليك ملخص نشاطك.</p>
      </div>

      <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
        {/* Subscription & Usage */}
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 opacity-0 animate-reveal-up delay-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-black text-slate-900">
                  {planInfo?.nameAr || (subscription?.tier === "FREE_TRIAL" ? "باقة التجربة" : subscription?.tier || "باقة التجربة")}
                </span>
                <span className="text-xs font-medium text-slate-400 mr-2">({planInfo?.nameEn || "Free"})</span>
              </div>
            </div>
            {subscription?.expiresAt && (
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                تنتهي في: {new Date(subscription.expiresAt).toLocaleDateString("ar-EG")}
              </span>
            )}
          </div>
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <UsageBar label="الطلاب" current={usage?.students?.current ?? stats.students} max={usage?.students?.max ?? null} />
            <UsageBar label="الاختبارات" current={usage?.quizzes?.current ?? stats.quizzes} max={usage?.quizzes?.max ?? null} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="opacity-0 animate-reveal-up delay-200">
            <StatCard
              label="الاختبارات"
              value={stats.quizzes}
              color="bg-primary-50"
              icon={
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
          </div>
          <div className="opacity-0 animate-reveal-up delay-200">
            <StatCard
              label="الطلاب"
              value={stats.students}
              color="bg-emerald-50"
              icon={
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          </div>
          <div className="opacity-0 animate-reveal-up delay-300">
            <StatCard
              label="التقديمات"
              value={stats.submissions}
              color="bg-amber-50"
              icon={
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
          <div className="opacity-0 animate-reveal-up delay-400">
            <StatCard
              label="الفصول"
              value={stats.classes}
              color="bg-rose-50"
              icon={
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
          </div>
          {showQuestionBank && (
            <div className="opacity-0 animate-reveal-up delay-400">
              <StatCard
                label="بنك الأسئلة"
                value={questionBankCount}
                color="bg-cyan-50"
                icon={
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          )}
          {showAssistants && (
            <div className="opacity-0 animate-reveal-up delay-400">
              <StatCard
                label="المساعدين"
                value={assistantsCount}
                color="bg-cyan-50"
                icon={
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
            </div>
          )}
        </div>
      </Suspense>

      {/* Quick Actions */}
      <h2 className="text-lg font-black text-slate-900 mb-6 opacity-0 animate-reveal-up delay-400">الإجراءات السريعة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/teacher/quizzes/create"
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary-300-lg transition-all group opacity-0 animate-reveal-up delay-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors animate-float">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-900">إنشاء اختبار جديد</p>
              <p className="text-sm text-slate-500">أنشئ اختبارًا جديدًا لطلابك</p>
            </div>
          </div>
        </Link>
        <Link
          to="/teacher/classes/create"
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all group opacity-0 animate-reveal-up delay-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-900">إنشاء فصل جديد</p>
              <p className="text-sm text-slate-500">أضف فصلاً جديدًا وأضف طلابك</p>
            </div>
          </div>
        </Link>
        {showAssistants && (
          <Link
            to="/teacher/assistants"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all group sm:col-span-2 md:col-span-1 opacity-0 animate-reveal-up delay-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-900">إدارة المساعدين</p>
                <p className="text-sm text-slate-500">منح صلاحيات الوصول للمساعدين</p>
              </div>
            </div>
          </Link>
        )}
        <Link
          to="/teacher/subscription"
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all group opacity-0 animate-reveal-up delay-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-900">الاشتراكات والخطط</p>
              <p className="text-sm text-slate-500">قم بترقية خطتك للحصول على مميزات أكثر</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
