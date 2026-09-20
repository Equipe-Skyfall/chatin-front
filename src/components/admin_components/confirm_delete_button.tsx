"use client";

import { useState } from "react";

interface ConfirmDeleteButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function ConfirmDeleteButton({ onConfirm, disabled = false }: ConfirmDeleteButtonProps) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        disabled={disabled}
        className="rounded-[8px] border border-line px-3 py-1.5 text-[10px] font-semibold text-gray transition-colors hover:border-[#d1442e] hover:text-[#d1442e] disabled:opacity-50"
      >
        Excluir
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className="rounded-[8px] bg-[#d1442e] px-3 py-1.5 text-[10px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Confirmar?
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className="rounded-[8px] px-2 py-1.5 text-[10px] text-gray"
      >
        Cancelar
      </button>
    </span>
  );
}
