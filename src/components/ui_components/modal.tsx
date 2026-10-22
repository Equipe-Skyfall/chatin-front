"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Ações alinhadas à direita no rodapé (secundário antes do primário). */
  footer?: ReactNode;
  size?: "md" | "lg";
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, title, onClose, children, footer, size = "md" }: ModalProps) {
  const tituloId = useId();
  const painelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const anterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const painel = painelRef.current;
    const primeiro = painel?.querySelector<HTMLElement>(FOCAVEIS);
    (primeiro ?? painel)?.focus();

    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !painel) return;

      const focaveis = Array.from(painel.querySelectorAll<HTMLElement>(FOCAVEIS));
      if (focaveis.length === 0) return;
      const inicio = focaveis[0];
      const fim = focaveis[focaveis.length - 1];
      if (event.shiftKey && document.activeElement === inicio) {
        event.preventDefault();
        fim.focus();
      } else if (!event.shiftKey && document.activeElement === fim) {
        event.preventDefault();
        inicio.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
      anterior?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const largura = size === "lg" ? "max-w-2xl" : "max-w-lg";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-full w-full ${largura} flex-col overflow-hidden rounded-[20px] bg-surface shadow-neo-raised outline-none`}
      >
        <header className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <h2 id={tituloId} className="font-display text-lg font-semibold text-charcoal">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-[8px] p-1 text-gray transition-colors hover:text-charcoal focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        {footer && <footer className="flex justify-end gap-2 px-5 pb-5 sm:px-6">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
