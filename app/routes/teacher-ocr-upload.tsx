import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch, API_BASE } from "../utils/api";
import { FeedbackBanner } from "../components/FeedbackBanner";
import type { Route } from "./+types/teacher-ocr-upload";

export function meta() {
  return [{ title: "استخراج الأسئلة من صورة | Quizaty" }];
}

export async function clientLoader() {
  const data = await apiFetch("/teacher/dashboard");
  return { limits: data.limits as any };
}

interface ExtractedQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
  imageUrl?: string;
}

export default function TeacherOcrUpload({ loaderData }: Route.ComponentProps) {
  const { limits } = loaderData as { limits: any };
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setExtractedQuestions(null);
      setErrors([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setExtractedQuestions(null);
      setErrors([]);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch(`${API_BASE}/teacher/ocr/extract`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل استخراج الأسئلة");
      }

      if (data.questions.length === 0) {
        setErrors(["لم يتم العثور على أسئلة في الصورة. تأكد من أن الصورة واضحة وتحتوي على أسئلة."]);
      } else {
        setExtractedQuestions(data.questions);
      }
      setSaveError(null);
      if (data.errors) {
        setErrors(data.errors);
      }
    } catch (err: any) {
      setErrors([err.message || "حدث خطأ أثناء الاستخراج"]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedQuestions || extractedQuestions.length === 0) return;
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`${API_BASE}/teacher/ocr/save`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions: extractedQuestions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل حفظ الأسئلة");
      }

      navigate("/teacher/question-bank");
    } catch (err: any) {
      setSaveError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedQuestions(null);
    setErrors([]);
    setSaveError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto text-right">
      {saveError && (
        <FeedbackBanner
          tone="error"
          message={saveError}
          className="mb-6"
        />
      )}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <Link
          to="/teacher/question-bank"
          className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-4"
        >
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          العودة لبنك الأسئلة
        </Link>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">استخراج الأسئلة من صورة</h2>
        <p className="text-slate-500 mt-2 text-lg">
          قم برفع صورة أو ملف PDF لاستخراج الأسئلة تلقائياً باستخدام الذكاء الاصطناعي.
        </p>
      </div>

      {!extractedQuestions ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3">الصورة أو ملف PDF</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {preview ? (
                <img src={preview} alt="Preview" className="max-w-full max-h-64 rounded-xl border border-slate-200 mx-auto" />
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-medium mb-2">اسحب الصورة هنا أو انقر للاختيار</p>
                  <p className="text-slate-400 text-sm">PNG, JPG, PDF (الحد الأقصى 10MB)</p>
                </>
              )}
            </div>
            {preview && (
              <button
                type="button"
                onClick={removeFile}
                className="mt-2 text-sm text-red-500 hover:text-red-700 mx-auto block cursor-pointer"
              >
                إزالة الصورة
              </button>
            )}
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl mb-6 text-sm font-medium">
              {errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleExtract}
            disabled={!selectedFile || loading}
            className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-sm font-black rounded-xl text-white bg-success-600 hover:bg-success-700 focus:outline-none shadow-lg shadow-success-100 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري استخراج الأسئلة...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                استخراج الأسئلة
              </>
            )}
          </button>

          <div className="mt-8 p-4 bg-secondary-50 rounded-xl border border-secondary-100">
            <h4 className="font-bold text-secondary-800 mb-2">نصائح للحصول على أفضل النتائج:</h4>
            <ul className="text-sm text-secondary-700 space-y-1">
              <li>• تأكد من أن الصورة واضحة ومشرقة</li>
              <li>• تأكد من وجود 4 خيارات (أ، ب، ج، د) لكل سؤال</li>
              <li>• أفضل النتائج تكون مع الأسئلة المطبوعة</li>
              <li>• يمكن استخدام صور من الكتب أو الاختبارات السابقة</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-success-50 border border-success-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-success-500 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-success-800 font-bold">تم استخراج {extractedQuestions.length} سؤال بنجاح!</span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {extractedQuestions.map((q, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-500">السؤال {index + 1}</span>
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-4">{q.questionText}</p>
                <div className="space-y-2">
                  {["أ", "ب", "ج", "د"].map((label, optIdx) => (
                    <div
                      key={optIdx}
                      className={`flex items-center p-3 rounded-xl ${
                        optIdx === q.correctOption ? "bg-success-50 border border-success-200" : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ml-3 ${
                          optIdx === q.correctOption ? "bg-success-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {label}
                      </span>
                      <span className={optIdx === q.correctOption ? "text-success-700 font-semibold" : "text-slate-700"}>
                        {q.options[optIdx]}
                      </span>
                      {optIdx === q.correctOption && (
                        <span className="mr-auto text-xs font-bold text-success-600 bg-success-100 px-2 py-1 rounded">الإجابة الصحيحة</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-sm font-black rounded-xl text-white bg-success-600 hover:bg-success-700 focus:outline-none shadow-lg shadow-success-100 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "جاري الحفظ..." : "حفظ الأسئلة في البنك"}
            </button>
            <button
              onClick={removeFile}
              className="inline-flex items-center justify-center px-6 py-4 border border-slate-300 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              استخراج أخرى
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
