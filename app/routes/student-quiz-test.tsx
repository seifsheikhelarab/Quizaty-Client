import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/student-quiz-test";

export function meta() {
  return [{ title: "اختبار مباشر | Quizaty" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await apiFetch(`/student/quizzes/${params.id}/test`);
  if (data.redirect) {
    throw new Response("Redirect", { status: 302, headers: { Location: data.redirect } });
  }
  return data;
}

interface Question {
  id: string;
  questionText: string;
  imageUrl: string | null;
  shuffledOptions: { originalIndex: number; text: string }[];
}

interface QuizData {
  quiz: {
    id: string;
    title: string;
    duration: number;
    questions: Question[];
  };
  submission: {
    id: string;
    startedAt: string;
  };
  savedAnswers: Record<string, string>;
  studentInfo?: {
    name: string;
    phone: string;
  };
}

export default function StudentQuizTest({ loaderData }: Route.ComponentProps) {
  const { quiz, submission, savedAnswers, studentInfo } = loaderData as QuizData;
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers || {});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const violationCountRef = useRef(0);
  
  // Anti-Cheat: Violation tracking (synced with server)
  const [violationCount, setViolationCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);

  // Enhanced anti-cheat: Block all external interactions
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation("right_click", "Right-click attempted");
    };
    
    // Disable copy/cut/paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation("copy_paste", "Copy/paste attempted");
    };
    
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation("copy_paste", "Cut attempted");
    };
    
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation("copy_paste", "Paste attempted");
    };
    
    // Disable keyboard shortcuts for copy/paste
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U (view source), F12
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'u')) || 
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        logViolation("keyboard_shortcut", `Keyboard shortcut Ctrl+${e.key} or ${e.key} attempted`);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [quiz.id]);

  // Log violation helper
  const logViolation = async (type: string, details: string) => {
    try {
      const data = await apiFetch(`/student/quizzes/${quiz.id}/violation`, {
        method: "POST",
        body: JSON.stringify({ 
          type, 
          details,
          metadata: { timestamp: Date.now() }
        }),
      });
      
      if (data.autoSubmitted) {
        navigate(`/student/quizzes/${quiz.id}/result`);
        return;
      }
      
      violationCountRef.current = data.violationCount || violationCountRef.current + 1;
      setViolationCount(violationCountRef.current);
    } catch (err) {
      console.error("Failed to log violation", err);
    }
  };

  // Tab switching / visibility detection
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && !isSubmitting && isTabActive) {
        setIsTabActive(false);
        await logViolation("tab_switch", "User switched away from the test tab");
        
        // Show warning
        if (violationCount < 2) {
          alert(violationCount === 0 
            ? "تحذير ⚠️: لقد غادرت صفحة الاختبار. يمنع الخروج من الصفحة أثناء أداء الاختبار. تكرار ذلك سيؤدي إلى تسليم الاختبار تلقائياً."
            : "تحذير نهائي 🚨: لقد غادرت صفحة الاختبار للمرة الثانية. في المرة القادمة سيتم تسليم الاختبار تلقائياً."
          );
        } else {
          alert("تم تسليم الاختبار 🛑: نظراً لتكرار مغادرة صفحة الاختبار، تم تسليم الإجابات تلقائياً.");
          handleSubmit(true);
        }
      } else if (!document.hidden) {
        setIsTabActive(true);
      }
    };

    // Focus detection (user clicking outside quiz)
    const handleBlur = async () => {
      if (!isSubmitting && document.visibilityState === 'visible') {
        await logViolation("focus_lost", "Window lost focus");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [quiz.id, isSubmitting, violationCount, isTabActive]);

  // DevTools detection (more robust)
  useEffect(() => {
    let devToolsCount = 0;
    const checkDevTools = () => {
      // Method 1: Check window dimensions
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const hasDevTools = widthDiff > threshold || heightDiff > threshold;
      
      if (hasDevTools && !isSubmitting) {
        devToolsCount++;
        if (devToolsCount >= 3) { // Only report after 3 consecutive detections
          logViolation("devtools", "DevTools or inspect element detected");
          devToolsCount = 0;
        }
      } else {
        devToolsCount = 0;
      }
    };

    const interval = setInterval(checkDevTools, 2000);
    return () => clearInterval(interval);
  }, [quiz.id, isSubmitting]);

  // Timer logic
  useEffect(() => {
    const started = new Date(submission.startedAt).getTime();
    const durationMs = quiz.duration * 60000;
    const end = started + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0 && !isSubmitting) {
        handleSubmit(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [submission.startedAt, quiz.duration, isSubmitting]);

  const handleAnswerChange = (questionId: string, optionIndex: string) => {
    const newAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(newAnswers);

    // Auto-save logic (debounced)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await apiFetch(`/student/quizzes/${quiz.id}/save`, {
          method: "POST",
          body: JSON.stringify({ answers: newAnswers }),
        });
      } catch (e) {
        console.error("Failed to save answers", e);
      }
    }, 1000);
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !confirm("هل أنت متأكد من تسليم إجاباتك؟ لن تتمكن من تعديلها لاحقاً.")) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiFetch(`/student/quizzes/${quiz.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      navigate(`/student/quizzes/${quiz.id}/result`);
    } catch (e) {
      console.error("Failed to submit", e);
      alert("حدث خطأ أثناء التسليم. يرجى المحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft < 300;

  // Anti-Cheat: Watermark with student name/phone (Elite tier only)
  const [showWatermark, setShowWatermark] = useState(false);

  // Watermark toggle for Elite tier
  useEffect(() => {
    const checkAntiCheat = async () => {
      try {
        const data = await apiFetch(`/student/dashboard`);
        if (data.limits?.antiCheat === "max") {
          setShowWatermark(true);
        }
      } catch (e) {}
    };
    checkAntiCheat();
  }, []);

  // Prevent leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "الاختبار لا يزال قيد التقدم. هل أنت متأكد من رغبتك في المغادرة؟";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ==========================================
  // Additional Anti-Cheat Features
  // ==========================================

  // 1. Multi-tab detection - prevent opening quiz in multiple tabs
  useEffect(() => {
    const channel = new BroadcastChannel('quizaty_quiz_channel');
    let has其他Tabs = false;

    channel.onmessage = (event) => {
      if (event.data.type === 'ping') {
        // Another tab is running this quiz
        has其他Tabs = true;
        alert("تم اكتشاف فتح الاختبار في أكثر من علامة تبويب. سيتم إغلاق هذه الصفحة.");
        window.close();
      }
    };

    // Send ping to check for other tabs
    channel.postMessage({ type: 'ping', quizId: quiz.id });
    
    // Periodically check
    const interval = setInterval(() => {
      channel.postMessage({ type: 'ping', quizId: quiz.id });
    }, 5000);

    return () => {
      channel.close();
      clearInterval(interval);
    };
  }, [quiz.id]);

  // 2. Screen recording/casting detection
  useEffect(() => {
    const checkScreenShare = async () => {
      try {
        const mediaDevices = navigator.mediaDevices as any;
        if (mediaDevices?.getDisplayMedia) {
          const stream = await mediaDevices.getDisplayMedia({ video: true, audio: false });
          logViolation("screen_share", "Screen recording or sharing detected");
          stream.getTracks().forEach((track: any) => track.stop());
        }
      } catch (err) {
        // User denied or API not available - this is expected
      }
    };

    // Also listen for display surface changes
    const mediaDevices = navigator.mediaDevices as any;
    if (mediaDevices?.addEventListener) {
      mediaDevices.addEventListener('devicechange', async () => {
        try {
          const streams = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = streams.filter((d: any) => d.kind === 'videoinput');
          if (videoInputs.length > 1) {
            logViolation("external_camera", "External camera or capture device detected");
          }
        } catch (e) {}
      });
    }

    // Periodically check
    const interval = setInterval(checkScreenShare, 30000);
    return () => clearInterval(interval);
  }, [quiz.id]);

  // 3. Watermark with student info (for identity verification)
  const watermarkText = studentInfo 
    ? `${studentInfo.name} - ${studentInfo.phone}` 
    : 'Quizaty';

  return (
    <div className="bg-slate-50 min-h-screen text-right font-[Cairo] pb-24">
      {/* Top Bar (Fixed) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm opacity-0 animate-reveal-down">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between flex-row-reverse">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-primary-50 text-primary-700 mb-1 border border-primary-100 uppercase tracking-wide">
              {quiz.title}
            </span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold border transition-colors flex-row-reverse ${
            isLowTime ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <span>⏱️</span>
            <span className="tabular-nums font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {violationCount > 0 && (
          <div className="bg-rose-500 text-white text-center py-2 text-sm font-bold animate-pulse">
            ⚠️ النظام يسجل خروجك من صفحة الاختبار ({violationCount}/3 تحذيرات). سيتم التسليم التلقائي في المرة الثالثة.
          </div>
        )}
      </div>

      {/* Watermark Overlay - Student info for identity verification */}
      {(showWatermark || studentInfo) && (
        <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-8 gap-4 transform rotate-12 translate-x-1/4 translate-y-1/4">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="text-lg font-bold text-slate-300 whitespace-nowrap">
                {watermarkText}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {quiz.questions.map((q, i) => (
            <div 
              key={q.id} 
              className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8 opacity-0 animate-reveal-up ${
                i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-400"
              }`} 
              id={`q-${i}`}
            >
              <div className="flex items-start mb-6 flex-row-reverse">
                <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-black text-sm shrink-0 ml-4 border border-primary-100">
                  {i + 1}
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-snug pt-0.5">{q.questionText}</h3>
              </div>

              {q.imageUrl && (
                <div className="mb-6 mr-12 opacity-0 animate-reveal-up delay-500">
                  <img src={q.imageUrl} alt="سؤال" className="max-h-64 rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform" />
                </div>
              )}

              <div className="space-y-3 mr-12">
                {q.shuffledOptions.map((opt, optIndex) => {
                  const val = opt.originalIndex.toString();
                  const isChecked = answers[q.id] === val;
                  return (
                    <label
                      key={optIndex}
                      className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all flex-row-reverse group select-none active:scale-[0.98] ${
                        isChecked ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500' : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={val}
                        checked={isChecked}
                        onChange={() => handleAnswerChange(q.id, val)}
                        className="w-5 h-5 text-primary-600 border-slate-300 focus:ring-primary-500 ml-4 transition-transform group-hover:scale-110"
                      />
                      <span className={`text-base font-medium flex-1 ${isChecked ? 'text-primary-900 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.08)] p-4 z-40 opacity-0 animate-reveal-up delay-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm font-medium text-slate-500">
            تم الإجابة على <span className="text-primary-600 font-black mx-1">{Object.keys(answers).length}</span> من <span className="text-slate-900 font-black mx-1">{quiz.questions.length}</span>
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-lg font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 animate-glow cursor-pointer"
          >
            {isSubmitting ? "جاري التسليم..." : "تسليم الاختبار"}
          </button>
        </div>
      </div>
    </div>
  );
}
