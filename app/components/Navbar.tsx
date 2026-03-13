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
  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "text-slate-900"
      : "text-slate-500 hover:text-slate-900";

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform -rotate-3">
              <svg
                className="w-5 h-5 text-white rotate-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900">Quizaty</h1>
          </Link>
          {!backUrl && (
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">
              {role === "teacher" ? "معلم" : "طالب"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          {backUrl ? (
            <Link
              to={backUrl}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
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
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {backText}
            </Link>
          ) : (
            <>
              {role === "teacher" && (
                <nav className="flex items-center gap-6">
                  <Link
                    to="/teacher/dashboard"
                    className={`text-sm font-bold transition-colors ${isActive("/teacher/dashboard")}`}
                  >
                    لوحة التحكم
                  </Link>
                  <Link
                    to="/teacher/quizzes"
                    className={`text-sm font-bold transition-colors ${isActive("/teacher/quizzes")}`}
                  >
                    الاختبارات
                  </Link>
                  <Link
                    to="/teacher/classes"
                    className={`text-sm font-bold transition-colors ${isActive("/teacher/classes")}`}
                  >
                    الفصول
                  </Link>
                </nav>
              )}
              {role === "student" && (
                <nav className="flex items-center gap-6">
                  <Link
                    to="/student/dashboard"
                    className={`text-sm font-bold transition-colors ${isActive("/student/dashboard")}`}
                  >
                    لوحة التحكم
                  </Link>
                  <Link
                    to="/student/quizzes"
                    className={`text-sm font-bold transition-colors ${isActive("/student/quizzes")}`}
                  >
                    الاختبارات
                  </Link>
                </nav>
              )}
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                  {userName ? userName.charAt(0).toUpperCase() : "م"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 group cursor-pointer"
              >
                <span>تسجيل الخروج</span>
                <svg
                  className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
