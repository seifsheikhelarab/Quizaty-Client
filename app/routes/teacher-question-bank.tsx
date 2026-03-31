import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../utils/api";
import type { Route } from "./+types/teacher-question-bank";

export function meta() {
  return [{ title: "بنك الأسئلة | Quizaty" }];
}

interface BankQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  imageUrl?: string;
  createdAt: string;
  quizCount?: number;
  quizTitles?: string[];
}

export async function clientLoader() {
  const [bankData, limitsData] = await Promise.all([
    apiFetch("/teacher/question-bank"),
    apiFetch("/teacher/dashboard"),
  ]);
  return {
    questions: bankData.questions as BankQuestion[],
    limits: limitsData.limits as any,
  };
}

export default function TeacherQuestionBank({ loaderData }: Route.ComponentProps) {
  const data = loaderData as { questions?: BankQuestion[]; limits?: any };
  const questions = data?.questions || [];
  const limits = data?.limits || {};
  const navigate = useNavigate();
  const [questionsList, setQuestionsList] = useState(questions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredQuestions = questionsList.filter((q) =>
    q.questionText.toLowerCase().includes(search.toLowerCase()) ||
    q.options.some((opt) => opt.toLowerCase().includes(search.toLowerCase()))
  );

  const canAddQuestion = limits?.questionBank === true;

  const deleteQuestion = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/teacher/question-bank/${id}`, { method: "DELETE" });
      setQuestionsList(questionsList.filter((q) => q.id !== id));
    } catch (err) {
      alert("فشل في حذف السؤال");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const questionText = formData.get("questionText") as string;
    const options = [
      formData.get("option1") as string,
      formData.get("option2") as string,
      formData.get("option3") as string,
      formData.get("option4") as string,
    ];
    const correctOption = parseInt(formData.get("correctOption") as string);
    const imageUrl = formData.get("imageUrl") as string;

    try {
      const res = await apiFetch("/teacher/question-bank", {
        method: "POST",
        body: JSON.stringify({ questionText, options, correctOption, imageUrl: imageUrl || null }),
      });
      if (res?.question) {
        setQuestionsList([res.question, ...questionsList]);
        setShowAddModal(false);
      }
    } catch (err: any) {
      alert(err.message || "فشل في إضافة السؤال");
    }
  };

  return (
    <div className="text-right">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">بنك الأسئلة</h2>
          <p className="text-slate-500 mt-2 text-lg">قم بإدارة أسئلتك واستخدامها في اختباراتك.</p>
        </div>
        
        {/* Search */}
        <div className="relative order-last md:order-none">
          <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="ابحث في الأسئلة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
          />
        </div>

        <div className="flex items-center gap-3 flex-row-reverse">
          {canAddQuestion && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none shadow-lg shadow-primary-100 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة سؤال
            </button>
          )}
          <Link
            to="/teacher/question-bank/ocr"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none shadow-lg shadow-primary-100 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            استخراج من صورة
          </Link>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-6">إضافة سؤال جديد</h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">نص السؤال</label>
                <textarea
                  name="questionText"
                  required
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="اكتب السؤال..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["أ", "ب", "ج", "د"].map((label, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">{label}</span>
                    <input
                      name={`option${idx + 1}`}
                      required
                      className="w-full border border-slate-300 rounded-xl px-8 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      placeholder={`الخيار ${label}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الإجابة الصحيحة</label>
                <div className="flex gap-4">
                  {["أ", "ب", "ج", "د"].map((label, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="correctOption" value={idx} required className="text-primary-600" />
                      <span className="text-sm font-bold text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700"
                >
                  إضافة السؤال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(questionsList.length === 0 || filteredQuestions.length === 0) ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          {filteredQuestions.length === 0 && search ? (
            <>
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج للبحث</h3>
              <p className="text-slate-500">جرب البحث بعبارة مختلفة</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">بنك الأسئلة فارغ</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">أضف أسئلتك لاستخدامها في الاختبارات. يمكنك استخراج الأسئلة من صور أو PDF أو إضافتها يدوياً.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/teacher/question-bank/ocr"
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none shadow-sm transition-colors"
                >
                  استخراج من صورة
                </Link>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-primary-200 text-sm font-bold rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none transition-colors"
                >
                  إضافة سؤال يدوي
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">💡 نصيحة: استخرج أسئلتك من صور الامتحانات السابقة!</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all">
              <div className="flex justify-between items-start mb-4 flex-row-reverse">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(q.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{q.questionText}</p>
                  {/* Quiz Usage Chips */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(q.quizCount || 0) > 0 ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-primary-100 text-primary-700">
                          مستخدم في {q.quizCount} اختبار{q.quizCount! > 1 ? 'ات' : ''}
                        </span>
                        {q.quizTitles?.slice(0, 2).map((title: string, i: number) => (
                          <span key={i} className="text-xs text-slate-500">• {title}</span>
                        ))}
                      </>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-500">
                        لم يُستخدم في أي اختبار
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  disabled={deletingId === q.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors mr-2 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {["أ", "ب", "ج", "د"].map((label, optIdx) => (
                  <div
                    key={optIdx}
                    className={`flex items-center p-3 rounded-xl ${
                      optIdx === q.correctOption
                        ? "bg-green-50 border border-green-200"
                        : "bg-slate-50 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ml-3 ${
                        optIdx === q.correctOption ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {label}
                    </span>
                    <span className={optIdx === q.correctOption ? "text-green-700 font-semibold" : "text-slate-700"}>
                      {q.options[optIdx]}
                    </span>
                    {optIdx === q.correctOption && (
                      <svg className="w-5 h-5 text-green-500 mr-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              {q.imageUrl && (
                <div className="mt-4">
                  <img src={q.imageUrl} alt="Question image" className="max-w-xs rounded-lg border border-slate-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
