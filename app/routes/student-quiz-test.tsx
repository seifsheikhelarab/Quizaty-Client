import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
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
  antiCheatLevel?: "basic" | "medium" | "advanced" | "max";
}

export default function StudentQuizTest({ loaderData }: Route.ComponentProps) {
  const { quiz, submission, savedAnswers, studentInfo, antiCheatLevel = "basic" } = loaderData as QuizData;
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers || {});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenViolationTimeoutRef = useRef<number | null>(null);
  const violationCountRef = useRef(0);
  const tabIdRef = useRef(`quiz-tab-${Math.random().toString(36).slice(2)}`);
  const violationLogRef = useRef<Map<string, number>>(new Map());
  const multiTabViolationLoggedRef = useRef(false);
  const tabStatusKey = `quizaty-active-quiz:${quiz.id}`;
  
  // Anti-Cheat: Violation tracking (synced with server)
  const [violationCount, setViolationCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    "يتم حفظ إجاباتك تلقائياً أثناء الحل."
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [multiTabWarning, setMultiTabWarning] = useState<string | null>(null);
  const antiCheatLevelRank = {
    basic: 0,
    medium: 1,
    advanced: 2,
    max: 3,
  } as const;
  const antiCheatRank = antiCheatLevelRank[antiCheatLevel] ?? 0;
  const supportsAdvancedChecks = antiCheatRank >= antiCheatLevelRank.advanced;
  const shouldShowWatermark = antiCheatRank >= antiCheatLevelRank.max;

  // Log violation helper
  const logViolation = async (
    type: string,
    details: string,
    options?: { cooldownMs?: number; metadata?: Record<string, unknown> }
  ) => {
    const cooldownMs = options?.cooldownMs ?? 12000;
    const lastLoggedAt = violationLogRef.current.get(type);
    const now = Date.now();

    if (lastLoggedAt && now - lastLoggedAt < cooldownMs) {
      return;
    }

    violationLogRef.current.set(type, now);

    try {
      const data = await apiFetch(`/student/quizzes/${quiz.id}/violation`, {
        method: "POST",
        body: JSON.stringify({ 
          type, 
          details,
          metadata: {
            timestamp: now,
            antiCheatLevel,
            ...(options?.metadata ?? {}),
          }
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
    const clearHiddenViolationTimeout = () => {
      if (hiddenViolationTimeoutRef.current !== null) {
        window.clearTimeout(hiddenViolationTimeoutRef.current);
        hiddenViolationTimeoutRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitting && isTabActive) {
        setIsTabActive(false);
        clearHiddenViolationTimeout();
        hiddenViolationTimeoutRef.current = window.setTimeout(async () => {
          if (!document.hidden || isSubmitting) {
            return;
          }

          await logViolation("tab_switch", "User switched away from the test tab", {
            cooldownMs: 15000,
            metadata: { visibilityState: document.visibilityState },
          });

          const currentViolations = violationCountRef.current;
          if (currentViolations < 3) {
            setStatusMessage(
              currentViolations <= 1
                ? "تحذير: غادرت صفحة الاختبار لمدة ملحوظة. تكرار ذلك قد يؤدي إلى تسليم الاختبار تلقائياً."
                : "تحذير نهائي: تكرار مغادرة صفحة الاختبار قد يؤدي إلى إنهاء الاختبار تلقائياً."
            );
          } else {
            setStatusMessage("تم رصد مغادرة الصفحة عدة مرات وسيتم تسليم الاختبار تلقائياً.");
            handleSubmit(true);
          }
        }, 1500);
      } else if (!document.hidden) {
        clearHiddenViolationTimeout();
        setIsTabActive(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearHiddenViolationTimeout();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [antiCheatLevel, isSubmitting, isTabActive, quiz.id]);

  useEffect(() => {
    if (!supportsAdvancedChecks) {
      return;
    }

    let devToolsCount = 0;
    const detectDevTools = () => {
      if (document.hidden || isSubmitting) {
        return;
      }

      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const hasDevTools = widthDiff > threshold || heightDiff > threshold;
      
      if (hasDevTools) {
        devToolsCount++;
        if (devToolsCount >= 2) {
          void logViolation("devtools", "DevTools or inspect element detected", {
            cooldownMs: 60000,
            metadata: { widthDiff, heightDiff },
          });
          devToolsCount = 0;
        }
      } else {
        devToolsCount = 0;
      }
    };

    const handleFocus = () => {
      devToolsCount = 0;
      detectDevTools();
    };

    window.addEventListener("resize", detectDevTools);
    window.addEventListener("focus", handleFocus);

    const interval = antiCheatLevel === "max"
      ? setInterval(detectDevTools, 15000)
      : null;

    return () => {
      window.removeEventListener("resize", detectDevTools);
      window.removeEventListener("focus", handleFocus);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [antiCheatLevel, isSubmitting, quiz.id, supportsAdvancedChecks]);

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
    setSaveState("saving");
    setStatusMessage("جاري حفظ إجابتك الأخيرة...");
    setSubmissionError(null);

    // Auto-save logic (debounced)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await apiFetch(`/student/quizzes/${quiz.id}/save`, {
          method: "POST",
          body: JSON.stringify({ answers: newAnswers }),
        });
        setSaveState("saved");
        setStatusMessage("تم حفظ الإجابات.");
      } catch (e) {
        console.error("Failed to save answers", e);
        setSaveState("error");
        setStatusMessage("تعذر حفظ الإجابات حالياً. سنحاول مجدداً عند تعديل إجابة أخرى.");
      }
    }, 1000);
  };

  const handleSubmit = async (auto = false) => {
    if (!auto) {
      setShowSubmitConfirm(true);
      return;
    }
    
    setIsSubmitting(true);
    setShowSubmitConfirm(false);
    setSubmissionError(null);
    setStatusMessage("جاري تسليم الاختبار...");
    try {
      await apiFetch(`/student/quizzes/${quiz.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      navigate(`/student/quizzes/${quiz.id}/result`);
    } catch (e) {
      console.error("Failed to submit", e);
      setSubmissionError("حدث خطأ أثناء التسليم. يرجى المحاولة مرة أخرى.");
      setStatusMessage("تعذر تسليم الاختبار حالياً.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft < 300;

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
    const announceMultiTab = () => {
      setMultiTabWarning("تم اكتشاف فتح نفس الاختبار في علامة تبويب أخرى. يرجى المتابعة من نافذة واحدة فقط.");
      setStatusMessage("تم اكتشاف أكثر من علامة تبويب لنفس الاختبار.");

      if (!multiTabViolationLoggedRef.current) {
        multiTabViolationLoggedRef.current = true;
        void logViolation("multiple_tabs", "Quiz opened in multiple tabs", {
          cooldownMs: 45000,
          metadata: { antiCheatLevel },
        });
      }
    };

    const syncTabStatus = () => {
      localStorage.setItem(
        tabStatusKey,
        JSON.stringify({
          tabId: tabIdRef.current,
          timestamp: Date.now(),
        })
      );
    };

    try {
      const existingStatusRaw = localStorage.getItem(tabStatusKey);
      if (existingStatusRaw) {
        const existingStatus = JSON.parse(existingStatusRaw) as { tabId?: string; timestamp?: number };
        if (
          existingStatus.tabId &&
          existingStatus.tabId !== tabIdRef.current &&
          typeof existingStatus.timestamp === "number" &&
          Date.now() - existingStatus.timestamp < 15000
        ) {
          announceMultiTab();
        }
      }
    } catch (error) {
      console.error("Failed to read quiz tab state", error);
    }

    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("quizaty_quiz_channel")
      : null;

    channel?.addEventListener("message", (event) => {
      if (
        event.data?.type === "quiz-opened" &&
        event.data?.quizId === quiz.id &&
        event.data?.tabId !== tabIdRef.current
      ) {
        announceMultiTab();
      }
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== tabStatusKey || !event.newValue) {
        return;
      }

      try {
        const nextStatus = JSON.parse(event.newValue) as { tabId?: string; timestamp?: number };
        if (
          nextStatus.tabId &&
          nextStatus.tabId !== tabIdRef.current &&
          typeof nextStatus.timestamp === "number" &&
          Date.now() - nextStatus.timestamp < 15000
        ) {
          announceMultiTab();
        }
      } catch (error) {
        console.error("Failed to parse quiz tab state", error);
      }
    };

    window.addEventListener("storage", handleStorage);

    channel?.postMessage({
      type: "quiz-opened",
      quizId: quiz.id,
      tabId: tabIdRef.current,
    });
    syncTabStatus();

    const heartbeat = window.setInterval(syncTabStatus, 10000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(heartbeat);
      try {
        const currentStatusRaw = localStorage.getItem(tabStatusKey);
        if (currentStatusRaw) {
          const currentStatus = JSON.parse(currentStatusRaw) as { tabId?: string };
          if (currentStatus.tabId === tabIdRef.current) {
            localStorage.removeItem(tabStatusKey);
          }
        }
      } catch {
        // Best-effort cleanup only.
      }
      channel?.close();
    };
  }, [antiCheatLevel, quiz.id, tabStatusKey]);

  // 3. Watermark with student info (for identity verification)
  const watermarkText = studentInfo 
    ? `${studentInfo.name} - ${studentInfo.phone}` 
    : 'Quizaty';

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-right font-[Cairo] pb-24">
      {/* Top Bar (Fixed) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm opacity-0 animate-reveal-down">
        <div className="max-w-4xl mx-auto px-6 min-h-16 py-3 flex items-center justify-between gap-4 flex-row-reverse">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-primary-50 text-primary-700 mb-1 border border-primary-100 uppercase tracking-wide">
              {quiz.title}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold border transition-colors flex-row-reverse ${
            isLowTime ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
            role="timer"
            aria-live={isLowTime ? "assertive" : "polite"}
            aria-atomic="true"
          >
            <span>⏱️</span>
            <span className="tabular-nums font-mono text-lg" dir="ltr">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {violationCount > 0 && (
          <div className="bg-rose-500 text-white text-center py-2 text-sm font-bold animate-pulse" role="status" aria-live="polite">
            ⚠️ النظام يسجل خروجك من صفحة الاختبار ({violationCount}/3 تحذيرات). سيتم التسليم التلقائي في المرة الثالثة.
          </div>
        )}
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {/* Watermark Overlay - Student info for identity verification */}
      {shouldShowWatermark && (
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
        {(multiTabWarning || submissionError || saveState !== "idle") && (
          <div className="mb-6 space-y-3">
            {multiTabWarning && (
              <div className="rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm font-medium text-warning-700" role="alert">
                {multiTabWarning}
              </div>
            )}
            {submissionError && (
              <div className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700" role="alert">
                {submissionError}
              </div>
            )}
            {saveState !== "idle" && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  saveState === "error"
                    ? "border-danger-200 bg-danger-50 text-danger-700"
                    : saveState === "saved"
                      ? "border-success-200 bg-success-50 text-success-700"
                      : "border-primary-200 bg-primary-50 text-primary-700"
                }`}
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          {quiz.questions.map((q, i) => (
            <fieldset
              key={q.id} 
              className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8 opacity-0 animate-reveal-up ${
                i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-400"
              }`} 
              id={`q-${i + 1}`}
            >
              <div className="flex items-start mb-6 flex-row-reverse">
                <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-black text-sm shrink-0 ml-4 border border-primary-100">
                  {i + 1}
                </span>
                <legend className="text-xl font-bold text-slate-900 leading-snug pt-0.5">
                  {q.questionText}
                </legend>
              </div>

              {q.imageUrl && (
                <div className="mb-6 mr-12 opacity-0 animate-reveal-up delay-500">
                  <img
                    src={q.imageUrl}
                    alt={`صورة مرفقة بالسؤال رقم ${i + 1}`}
                    className="max-h-64 rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform"
                  />
                </div>
              )}

              <div className="space-y-3 mr-12" role="radiogroup" aria-label={`خيارات السؤال رقم ${i + 1}`}>
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
                        aria-label={`اختيار ${opt.text}`}
                        className="w-5 h-5 text-primary-600 border-slate-300 focus:ring-primary-500 ml-4"
                      />
                      <span className={`text-base font-medium flex-1 ${isChecked ? 'text-primary-900 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 inset-x-0 border-t border-slate-200 bg-white p-4 z-40 opacity-0 animate-reveal-up delay-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm font-medium text-slate-500">
            تم الإجابة على <span className="text-primary-600 font-black mx-1">{Object.keys(answers).length}</span> من <span className="text-slate-900 font-black mx-1">{quiz.questions.length}</span>
          </div>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-lg font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 cursor-pointer"
            aria-haspopup="dialog"
          >
            {isSubmitting ? "جاري التسليم..." : "تسليم الاختبار"}
          </button>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-quiz-title"
            aria-describedby="submit-quiz-description"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)]"
          >
            <h2 id="submit-quiz-title" className="text-xl font-black text-slate-900">
              تأكيد تسليم الاختبار
            </h2>
            <p id="submit-quiz-description" className="mt-3 text-sm leading-7 text-slate-600">
              بعد التسليم لن تتمكن من تعديل إجاباتك. هل تريد المتابعة الآن؟
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                onClick={() => setShowSubmitConfirm(false)}
              >
                العودة للاختبار
              </button>
              <button
                type="button"
                className="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary-700"
                onClick={() => handleSubmit(true)}
              >
                تأكيد التسليم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
