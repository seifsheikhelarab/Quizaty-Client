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

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "text-indigo-600 bg-indigo-50 md:bg-transparent md:text-slate-900"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 md:hover:bg-transparent";

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const navLinks = role === "teacher" 
    ? [
        { name: "لوحة التحكم", path: "/teacher/dashboard" },
        { name: "الاختبارات", path: "/teacher/quizzes" },
        { name: "الفصول", path: "/teacher/classes" },
      ]
    : [
        { name: "لوحة التحكم", path: "/student/dashboard" },
        { name: "الاختبارات", path: "/student/quizzes" },
      ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 opacity-0 animate-reveal-down">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform -rotate-3">
              <svg className="w-5 h-5 text-white rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900 hidden sm:block">Quizaty</h1>
          </Link>
          {!backUrl && (
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold rounded-md border border-indigo-100 uppercase tracking-wider">
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
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} className={`text-sm font-bold transition-colors ${isActive(link.path)}`}>
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:block h-6 w-px bg-slate-200" />
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 text-xs">
                  {userName ? userName.charAt(0).toUpperCase() : "م"}
                </div>
                <div className="hidden sm:block text-xs font-bold text-slate-700 max-w-[100px] truncate">
                  {userName}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden md:flex text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors items-center gap-1.5 group cursor-pointer"
              >
                <span>الخروج</span>
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className={`md:hidden p-2 text-slate-500 hover:text-slate-900 transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-90 scale-110' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 z-40 md:hidden overflow-hidden shadow-2xl rounded-b-4xl animate-reveal-down">
            <nav className="flex flex-col p-6 space-y-1">
              {navLinks.map((link, i) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`py-4 px-5 rounded-2xl text-base font-black transition-all flex items-center justify-between opacity-0 animate-reveal-right ${
                    i === 0 ? "delay-100" : i === 1 ? "delay-150" : "delay-200"
                  } ${isActive(link.path)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
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
                className="w-full text-right py-4 px-5 rounded-2xl text-base font-black text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-between opacity-0 animate-reveal-right delay-300"
              >
                <span>تسجيل الخروج</span>
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </button>
            </nav>
            <div className="bg-slate-50 p-6 flex items-center justify-between opacity-0 animate-reveal-up delay-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                  {userName ? userName.charAt(0).toUpperCase() : "م"}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{userName}</div>
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
