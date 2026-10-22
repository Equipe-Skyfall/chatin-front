"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { atualizarMateria } from "@/lib/content";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import type { Materia } from "@/lib/materias";

interface EditarMateriaDialogProps {
  /** Apostila a editar; `null` fecha o dialog. */
  materia: Materia | null;
  onClose: () => void;
  /** Chamado após salvar com sucesso (para recarregar a lista). */
  onSalva: () => void;
}

export function EditarMateriaDialog({ materia, onClose, onSalva }: EditarMateriaDialogProps) {
  const [nome, setNome] = useState(materia?.nome ?? "");
  const [descricao, setDescricao] = useState(materia?.descricao ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!materia || typeof document === "undefined") return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!materia || nome.trim().length < 2 || salvando) return;

    setSalvando(true);
    setErro(null);
    try {
      await atualizarMateria(materia.id, { nome: nome.trim(), descricao: descricao.trim() || null });
      onSalva();
      onClose();
    } catch (error) {
      setErro(getFriendlyErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-8" onClick={onClose}>
      <div
        className="flex max-h-full w-full max-w-md flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-display text-[16px] font-semibold text-charcoal">Editar apostila</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            aria-label="Fechar"
            className="text-gray hover:text-charcoal disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-5">
          <div className="grid gap-1.5">
            <label htmlFor="editar-nome" className="text-[12.5px] font-medium text-charcoal">
              Nome da matéria
            </label>
            <input
              id="editar-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              minLength={2}
              maxLength={200}
              required
              className="h-10 rounded-lg border border-line px-3 text-[13px] outline-none focus:border-orange"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="editar-descricao" className="text-[12.5px] font-medium text-charcoal">
              Descrição
            </label>
            <textarea
              id="editar-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="resize-none rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-orange"
            />
          </div>

          {erro && <p className="text-[12px] text-[#a83f2e]">{erro}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="rounded-[9px] border border-line px-4 py-2 text-[12.5px] font-semibold text-gray transition hover:border-orange hover:text-orange disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-[9px] bg-orange-light px-4 py-2 text-[12.5px] font-bold text-white shadow-neo-raised-sm transition hover:brightness-95 disabled:opacity-60"
            >
              {salvando && <Loader2 size={14} className="animate-spin" />} Salvar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
