"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Loader2, Sparkles, X } from "lucide-react";
import { useCriarMateria } from "@/hooks/use_criar_materia";

interface CriarMateriaDialogProps {
  open: boolean;
  onClose: () => void;
  onCriada: (materiaId: string) => void;
}

export function CriarMateriaDialog({ open, onClose, onCriada }: CriarMateriaDialogProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [titulo, setTitulo] = useState("");
  const [direcionamento, setDirecionamento] = useState("");

  function limparCampos() {
    setNome("");
    setDescricao("");
    setTitulo("");
    setDirecionamento("");
  }

  // Só matéria + tema são criados aqui; os módulos são gerados em segundo plano
  // (o dialog fecha na hora e o aluno segue navegando).
  const { etapa, erro, criar, reiniciar } = useCriarMateria((materiaId) => {
    limparCampos();
    onCriada(materiaId);
  });

  if (!open || typeof document === "undefined") return null;

  const bloqueado = etapa === "criando";

  function fechar() {
    if (bloqueado) return;
    reiniciar();
    limparCampos();
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !descricao.trim() || !titulo.trim() || !direcionamento.trim()) return;
    criar({ nome, descricao, titulo, direcionamento });
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-8" onClick={fechar}>
      <div
        className="flex max-h-full w-full max-w-md flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-display text-[16px] font-semibold text-charcoal">Nova apostila</h2>
          <button
            type="button"
            onClick={fechar}
            disabled={bloqueado}
            className="text-gray hover:text-charcoal disabled:opacity-40"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {etapa === "formulario" && (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="nome" className="text-[12.5px] font-medium text-charcoal">
                  Nome da matéria
                </label>
                <input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Biologia Celular"
                  className="h-10 rounded-lg border border-line px-3 text-[13px] outline-none focus:border-orange"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="descricao" className="text-[12.5px] font-medium text-charcoal">
                  Descrição da matéria
                </label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Sobre o que é essa matéria?"
                  rows={2}
                  className="resize-none rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-orange"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="titulo" className="text-[12.5px] font-medium text-charcoal">
                  Título do primeiro tópico
                </label>
                <input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Estrutura da célula"
                  className="h-10 rounded-lg border border-line px-3 text-[13px] outline-none focus:border-orange"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="direcionamento" className="text-[12.5px] font-medium text-charcoal">
                  O que a IA deve explicar?
                </label>
                <textarea
                  id="direcionamento"
                  value={direcionamento}
                  onChange={(e) => setDirecionamento(e.target.value)}
                  placeholder="Descreva o que você quer aprender. A IA vai gerar os módulos e o conteúdo em segundo plano."
                  rows={4}
                  className="resize-none rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-orange"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-1 flex h-11 items-center justify-center gap-2 rounded-[10px] bg-orange-light text-[13px] font-bold text-white shadow-neo-raised transition hover:brightness-95"
              >
                <Sparkles size={15} /> Gerar apostila com IA
              </button>
            </form>
          )}

          {bloqueado && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Loader2 size={32} className="animate-spin text-orange" />
              <div>
                <p className="text-[13.5px] font-medium text-charcoal">Preparando sua apostila...</p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-gray">
                  O conteúdo será gerado em segundo plano — você pode continuar navegando e avisaremos quando ficar
                  pronto.
                </p>
              </div>
            </div>
          )}

          {etapa === "erro" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-[13.5px] font-medium text-charcoal">Algo deu errado</p>
              <p className="text-[12px] text-gray">{erro}</p>
              <button
                type="button"
                onClick={reiniciar}
                className="mt-2 rounded-lg border border-orange px-4 py-2 text-[12.5px] font-semibold text-orange transition hover:bg-orange/10"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
