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
}

export default function StudentQuizTest({ loaderData }: Route.ComponentProps) {
  const { quiz, submission, savedAnswers } = loaderData as QuizData;
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers || {});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Anti-Cheat: Tab switching detection
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && !isSubmitting) {
        setViolationCount((prev) => prev + 1);
        
        try {
          await apiFetch(`/student/quizzes/${quiz.id}/violation`, {
            method: "POST",
            body: JSON.stringify({ type: "tab_switch", details: "User switched away from the test tab" }),
          });
        } catch (err) {
          console.error("Failed to log violation", err);
        }

        if (violationCount === 0) {
          alert("تحذير ⚠️: لقد غادرت صفحة الاختبار. يمنع الخروج من الصفحة أثناء أداء الاختبار. تكرار ذلك سيؤدي إلى تسليم الاختبار تلقائياً.");
        } else if (violationCount === 1) {
          alert("تحذير نهائي 🚨: لقد غادرت صفحة الاختبار للمرة الثانية. في المرة القادمة سيتم تسليم الاختبار تلقائياً.");
        } else if (violationCount >= 2) {
          alert("تم تسليم الاختبار 🛑: نظراً لتكرار مغادرة صفحة الاختبار، تم تسليم الإجابات تلقائياً.");
          handleSubmit(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [quiz.id, isSubmitting, violationCount]);

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

  const isLowTime = timeLeft < 300; // Less than 5 minutes

  // Prevent leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "الاختبار لا يزال قيد التقدم. هل أنت متأكد من رغبتك في المغادرة؟";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-right font-[Cairo] pb-24">
      {/* Top Bar (Fixed) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm opacity-0 animate-reveal-down">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between flex-row-reverse">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 mb-1 border border-indigo-100 uppercase tracking-wide">
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
                <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 ml-4 border border-indigo-100">
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
                        isChecked ? 'border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={val}
                        checked={isChecked}
                        onChange={() => handleAnswerChange(q.id, val)}
                        className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500 ml-4 transition-transform group-hover:scale-110"
                      />
                      <span className={`text-base font-medium flex-1 ${isChecked ? 'text-indigo-900 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{opt.text}</span>
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
            تم الإجابة على <span className="text-indigo-600 font-black mx-1">{Object.keys(answers).length}</span> من <span className="text-slate-900 font-black mx-1">{quiz.questions.length}</span>
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-lg font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 animate-glow cursor-pointer"
          >
            {isSubmitting ? "جاري التسليم..." : "تسليم الاختبار"}
          </button>
        </div>
      </div>
    </div>
  );
}
