import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { apiFetch } from "../utils/api";

export function meta() {
  return [{ title: "الانضمام إلى الفصل | Quizaty" }];
}

export default function InvitePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processInvite = async () => {
      try {
        // First check if user is logged in
        const authData = await apiFetch("/auth/me").catch(() => null);

        if (authData && authData.user && authData.user.role === "student") {
          // User is logged in as a student, join class directly
          try {
             await apiFetch(`/classes/${id}/join`, { method: "POST" });
             navigate("/student/classes");
          } catch (err: any) {
             console.error("Failed to join class:", err.message);
             alert(err.message || "حدث خطأ أثناء الانضمام للفصل");
             navigate("/student/dashboard");
          }
        } else if (authData && authData.user && authData.user.role === "teacher") {
             // Let teacher know they cannot join classes
             alert("المعلمون لا يمكنهم الانضمام كطلاب للفصول");
             navigate("/teacher/dashboard");
        } else {
             // User is not logged in
             // Store the classId in sessionStorage so we can pick it up after login/register
             sessionStorage.setItem("inviteClassId", id || "");
             // Redirect to register with a nice message or param if needed
             navigate("/register");
        }

      } catch (err) {
        console.error("Invite processing error:", err);
      }
    };

    processInvite();
  }, [id, navigate]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">جاري معالجة الدعوة...</h2>
        <p className="text-slate-500 mt-2 text-sm text-center">يرجى الانتظار بينما نقوم بإعداد الفصل لك.</p>
    </div>
  );
}
