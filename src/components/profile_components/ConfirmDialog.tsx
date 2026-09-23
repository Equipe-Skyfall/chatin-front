"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#8b929b] hover:text-[#18202b]"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <h3 id="confirm-dialog-title" className="mt-4 text-lg font-semibold text-[#18202b]">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-[#737a84]">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Excluindo..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#18202b] transition hover:bg-[#f9fafb]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}