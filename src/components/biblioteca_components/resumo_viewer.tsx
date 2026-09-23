"use client";

import type { ReactNode } from "react";
import { Download, X } from "lucide-react";
import { urlPdfResumo } from "@/lib/resumos";
import type { ResumoEstudo, ResumoEstudoConteudo } from "@/interfaces/resumo_interfaces";

interface SecaoProps {
  titulo: string;
  children: ReactNode;
}

function Secao({ titulo, children }: SecaoProps) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="font-display text-[13px] font-semibold text-charcoal">{titulo}</h3>
      <div className="flex flex-col gap-1 text-[13px] leading-relaxed text-charcoal/90">
        {children}
      </div>
    </section>
  );
}

const LISTAS: { chave: keyof ResumoEstudoConteudo; titulo: string }[] = [
  { chave: "pontos_importantes", titulo: "Pontos importantes" },
  { chave: "exemplos", titulo: "Exemplos" },
  { chave: "revisao_rapida", titulo: "Revisão rápida" },
  { chave: "fontes", titulo: "Fontes" },
];

interface ResumoViewerProps {
  resumo: ResumoEstudo;
  onFechar: () => void;
}

export function ResumoViewer({ resumo, onFechar }: ResumoViewerProps) {
  const conteudo = resumo.conteudo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onFechar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[16px] bg-white shadow-neo-raised"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-semibold text-charcoal">
              {resumo.modulo_titulo || resumo.titulo}
            </h2>
            <p className="text-[11px] text-gray">
              {[resumo.materia_nome, resumo.tema_titulo].filter(Boolean).join(" / ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-gray transition-colors hover:bg-orange/10 hover:text-orange"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {conteudo.visao_geral && (
            <Secao titulo="Visão geral">
              <p>{conteudo.visao_geral}</p>
            </Secao>
          )}

          {conteudo.conceitos_chave.length > 0 && (
            <Secao titulo="Conceitos-chave">
              {conteudo.conceitos_chave.map((conceito, indice) => (
                <p key={indice}>
                  <strong>{conceito.termo}:</strong> {conceito.explicacao}
                </p>
              ))}
            </Secao>
          )}

          {conteudo.duvidas_do_aluno.length > 0 && (
            <Secao titulo="Dúvidas e respostas">
              {conteudo.duvidas_do_aluno.map((duvida, indice) => (
                <p key={indice}>
                  <strong>Pergunta:</strong> {duvida.pergunta}
                  <br />
                  <strong>Resposta:</strong> {duvida.resposta}
                </p>
              ))}
            </Secao>
          )}

          {LISTAS.map(({ chave, titulo }) => {
            const itens = conteudo[chave] as string[];
            if (itens.length === 0) return null;
            return (
              <Secao key={chave} titulo={titulo}>
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {itens.map((item, indice) => (
                    <li key={indice}>{item}</li>
                  ))}
                </ul>
              </Secao>
            );
          })}
        </div>

        <footer className="flex justify-end border-t border-line px-6 py-3">
          <a
            href={urlPdfResumo(resumo.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-[9px] bg-orange px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-orange-light"
          >
            <Download size={15} />
            Baixar PDF
          </a>
        </footer>
      </div>
    </div>
  );
}
