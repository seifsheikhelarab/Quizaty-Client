interface FeedbackBannerProps {
  tone?: "error" | "success" | "info";
  message: string;
  className?: string;
}

export function FeedbackBanner({
  tone = "info",
  message,
  className = "",
}: FeedbackBannerProps) {
  const toneStyles =
    tone === "error"
      ? "border-danger-200 bg-danger-50 text-danger-700"
      : tone === "success"
        ? "border-success-200 bg-success-50 text-success-700"
        : "border-secondary-200 bg-secondary-50 text-secondary-700";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${toneStyles} ${className}`.trim()}
    >
      {message}
    </div>
  );
}
