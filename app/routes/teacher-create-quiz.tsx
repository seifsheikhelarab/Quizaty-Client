import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-create-quiz";

export function meta() {
  return [{ title: "إنشاء اختبار جديد | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/teacher/classes");
  return data;
}

interface QuestionForm {
  text: string;
  options: string[];
  correctOption: number;
}

export default function TeacherCreateQuiz({ loaderData }: Route.ComponentProps) {
  const { classes, limits } = loaderData as { classes: { id: string; name: string }[], limits: any };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { text: "", options: ["", "", "", ""], correctOption: 0 },
  ]);

  // Question Bank State
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);

  const fetchBankQuestions = async () => {
    setLoadingBank(true);
    try {
      const data = await apiFetch("/teacher/question-bank");
      setBankQuestions(data.questions);
    } catch (err: any) {
      alert(err.message || "فشل تحميل بنك الأسئلة");
    } finally {
      setLoadingBank(false);
    }
  };

  const openBankModal = () => {
    setShowBankModal(true);
    fetchBankQuestions();
  };

  const importQuestion = (bankQ: any) => {
    setQuestions([
      ...questions,
      { text: bankQ.questionText, options: bankQ.options, correctOption: bankQ.correctOption }
    ]);
  };

  const saveToBank = async (q: QuestionForm) => {
    if (!q.text || q.options.some((o) => !o.trim())) {
      alert("الرجاء إكمال السؤال وخياراته أولاً");
      return;
    }
    try {
      await apiFetch("/teacher/question-bank", {
        method: "POST",
        body: JSON.stringify({ questionText: q.text, options: q.options, correctOption: q.correctOption }),
      });
      alert("تم حفظ السؤال في بنك الأسئلة بنجاح!");
    } catch (err: any) {
      alert(err.message || "فشل حفظ السؤال");
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correctOption: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const toggleClass = (id: string) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const totalMarks = questions.length;
      const data = await apiFetch("/teacher/quizzes", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          startTime: form.get("startTime"),
          endTime: form.get("endTime"),
          duration: form.get("duration"),
          totalMarks,
          classIds: selectedClasses,
          questions: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
          })),
        }),
      });
      navigate(`/teacher/quizzes/${data.quiz.id}`);
    } catch (err: any) {
      setError(err.message || "فشل إنشاء الاختبار");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";

  return (
    <div className="max-w-3xl mx-auto text-right">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">إنشاء اختبار جديد</h2>
        <p className="text-slate-500 mt-2 text-lg">أنشئ اختبارًا وأضف الأسئلة.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-5 py-4 rounded-xl mb-6 text-sm font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">بيانات الاختبار</h3>
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">عنوان الاختبار</label>
              <input type="text" name="title" id="title" required className={inputCls} placeholder="مثال: اختبار الفصل الأول" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                الوصف <span className="text-slate-400 font-normal mr-1">(اختياري)</span>
              </label>
              <textarea name="description" id="description" rows={2} className={inputCls} placeholder="وصف موجز للاختبار" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-bold text-slate-700 mb-2">وقت البداية</label>
                <input type="datetime-local" name="startTime" id="startTime" required className={inputCls} />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-bold text-slate-700 mb-2">وقت النهاية</label>
                <input type="datetime-local" name="endTime" id="endTime" required className={inputCls} />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-bold text-slate-700 mb-2">المدة (دقائق)</label>
                <input type="number" name="duration" id="duration" required min="1" className={inputCls} placeholder="30" />
              </div>
            </div>
          </div>
        </div>

        {/* Assign Classes */}
        {classes.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">تعيين لفصول</h3>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleClass(c.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                    selectedClasses.includes(c.id)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">الأسئلة ({questions.length})</h3>
            <div className="flex items-center gap-3">
              {limits?.questionBank && (
                <button type="button" onClick={openBankModal} className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200">
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  استيراد من بنك الأسئلة
                </button>
              )}
              <button type="button" onClick={addQuestion} className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                إضافة سؤال
              </button>
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 flex-row-reverse border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-500">سؤال {qi + 1}</span>
                <div className="flex items-center gap-3">
                  {limits?.questionBank && (
                    <button type="button" onClick={() => saveToBank(q)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer transition-colors">
                      حفظ في بنك الأسئلة
                    </button>
                  )}
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qi)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer transition-colors">حذف</button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                  required
                  className={inputCls}
                  placeholder="نص السؤال"
                />
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-3 flex-row-reverse">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctOption === oi}
                        onChange={() => updateQuestion(qi, "correctOption", oi)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        required
                        className="flex-1 border border-slate-300 rounded-lg py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                        placeholder={`الخيار ${oi + 1}`}
                      />
                      {q.correctOption === oi && (
                        <span className="text-xs font-bold text-emerald-600">✓ صحيح</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 space-x-reverse pt-4">
          <Link to="/teacher/quizzes" className="px-6 py-3 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            إلغاء
          </Link>
          <button type="submit" disabled={loading} className="px-8 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? "جاري الإنشاء..." : "إنشاء الاختبار"}
          </button>
        </div>
      </form>

      {/* Question Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl flex-row-reverse">
              <h3 className="font-bold text-lg text-slate-900">بنك الأسئلة</h3>
              <button type="button" onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-right">
              {loadingBank ? (
                <div className="text-center py-8 text-slate-500 text-sm">جاري التحميل...</div>
              ) : bankQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h4 className="text-slate-900 font-bold mb-1">لا توجد أسئلة محفوظة</h4>
                  <p className="text-slate-500 text-sm">قم بحفظ أسئلة في بنك الأسئلة لتتمكن من استخدامها مراراً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankQuestions.map((bq) => (
                    <div key={bq.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all bg-white relative group">
                      <p className="font-bold text-sm text-slate-900 mb-3">{bq.questionText}</p>
                      <ul className="grid grid-cols-2 gap-2 mb-4">
                        {bq.options.map((opt: string, i: number) => (
                          <li key={i} className={`text-xs p-2 rounded-lg border text-right ${i === bq.correctOption ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                            {opt} {i === bq.correctOption && '✓'}
                          </li>
                        ))}
                      </ul>
                      <button 
                        type="button" 
                        onClick={() => { importQuestion(bq); setShowBankModal(false); }}
                        className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                      >
                        إضافة للاختبار الحالي
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
