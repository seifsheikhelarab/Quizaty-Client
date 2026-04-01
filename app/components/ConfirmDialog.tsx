interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const toneStyles =
    tone === "danger"
      ? {
          iconWrap: "bg-danger-50 text-danger-700",
          confirm:
            "bg-danger-600 text-white hover:bg-danger-700 disabled:hover:bg-danger-600",
        }
      : {
          iconWrap: "bg-warning-50 text-warning-700",
          confirm:
            "bg-warning-600 text-white hover:bg-warning-700 disabled:hover:bg-warning-600",
        };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4 flex-row-reverse">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneStyles.iconWrap}`}
            aria-hidden="true"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <h2 id="confirm-dialog-title" className="text-lg font-black text-slate-900">
              {title}
            </h2>
            <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneStyles.confirm}`}
          >
            {busy ? "جاري التنفيذ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
