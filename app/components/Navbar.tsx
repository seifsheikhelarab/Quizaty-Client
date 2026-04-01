import { useState } from "react";
import { Link, useLocation } from "react-router";
import { apiFetch } from "../utils/api";

interface NavbarProps {
  userName?: string;
  role: "teacher" | "student";
  backUrl?: string;
  backText?: string;
}

export function Navbar({ userName, role, backUrl, backText }: NavbarProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = `mobile-nav-${role}`;
  const displayName = userName?.trim() || (role === "teacher" ? "المعلم" : "الطالب");
  const avatarLabel = displayName.charAt(0).toUpperCase();

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "text-primary-700 bg-primary-50/80 md:bg-transparent md:text-primary-700"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 md:hover:bg-transparent";

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const navLinks = role === "teacher" 
    ? [
        { name: "لوحة التحكم", path: "/teacher/dashboard" },
        { name: "الاختبارات", path: "/teacher/quizzes" },
        { name: "بنك الأسئلة", path: "/teacher/question-bank" },
        { name: "الفصول", path: "/teacher/classes" },
        { name: "الاشتراكات", path: "/teacher/subscription" },
      ]
    : [
        { name: "لوحة التحكم", path: "/student/dashboard" },
        { name: "الاختبارات", path: "/student/quizzes" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.05)] opacity-0 animate-reveal-down">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"}
            className="flex items-center gap-3"
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900 hidden sm:block">Quizaty</h1>
          </Link>
          {!backUrl && (
            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] sm:text-xs font-bold rounded-md border border-primary-100 uppercase tracking-wider">
              {role === "teacher" ? "معلم" : "طالب"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {backUrl ? (
            <Link to={backUrl} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {backText}
            </Link>
          ) : (
            <>
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6" aria-label="التنقل الرئيسي">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-bold transition-colors ${isActive(link.path)}`}
                    aria-current={location.pathname.startsWith(link.path) ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:block h-6 w-px bg-slate-200" />
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold border border-primary-100 text-xs">
                  {avatarLabel}
                </div>
                <div className="hidden sm:block text-xs font-bold text-slate-700 max-w-[100px] truncate">
                  {displayName}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden md:flex text-sm font-bold text-slate-500 hover:text-danger-600 transition-colors items-center gap-1.5 group cursor-pointer"
                aria-label="تسجيل الخروج"
              >
                <span>الخروج</span>
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls={mobileMenuId}
                aria-label={isMobileMenuOpen ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && !backUrl && (
        <>
          <div 
            className="fixed inset-0 z-30 bg-slate-900/18 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id={mobileMenuId}
            className="absolute top-16 left-0 right-0 z-40 overflow-hidden border-b border-slate-200 bg-white shadow-[0_12px_24px_-20px_rgba(15,23,42,0.28)] md:hidden animate-reveal-down"
          >
            <nav className="flex flex-col p-6 space-y-1" aria-label="التنقل الرئيسي للجوال">
              {navLinks.map((link, i) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`py-4 px-5 rounded-2xl text-base font-black transition-colors flex items-center justify-between opacity-0 animate-reveal-right ${
                    i === 0 ? "delay-100" : i === 1 ? "delay-150" : "delay-200"
                  } ${isActive(link.path)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={location.pathname.startsWith(link.path) ? "page" : undefined}
                >
                  <span>{link.name}</span>
                  <svg className="w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              ))}
              
              <div className="h-px bg-slate-100 my-4 mx-4 opacity-0 animate-reveal-right delay-250" />
              
              <button
                onClick={handleLogout}
                className="w-full text-right py-4 px-5 rounded-2xl text-base font-black text-danger-600 hover:bg-danger-50 transition-all flex items-center justify-between opacity-0 animate-reveal-right delay-300"
                aria-label="تسجيل الخروج"
              >
                <span>تسجيل الخروج</span>
                <div className="w-10 h-10 bg-danger-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </button>
            </nav>
            <div className="border-t border-slate-100 bg-slate-50 p-6 flex items-center justify-between opacity-0 animate-reveal-up delay-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  {avatarLabel}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{displayName}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role === "teacher" ? "معلم" : "طالب"}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
