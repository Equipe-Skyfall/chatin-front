"use client";

import { useId, useRef, useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import type { FonteWeb } from "@/interfaces/chat_interfaces";

interface FontesPopoverProps {
  fontes: FonteWeb[];
}

// Altura aproximada do card com 3 fontes; abaixo disso de espaço livre acima do chip, abre para baixo.
const ESPACO_MINIMO_ACIMA_PX = 240;

function ehLinkSeguro(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function dominioDe(fonte: FonteWeb): string {
  if (fonte.dominio) return fonte.dominio;
  try {
    return new URL(fonte.url).hostname.replace(/^www\./, "");
  } catch {
    return fonte.url;
  }
}

function paiComRolagem(elemento: HTMLElement | null): HTMLElement | null {
  let atual = elemento?.parentElement ?? null;
  while (atual) {
    const { overflowY } = getComputedStyle(atual);
    if (overflowY === "auto" || overflowY === "scroll") return atual;
    atual = atual.parentElement;
  }
  return null;
}

export function FontesPopover({ fontes }: FontesPopoverProps) {
  const [aberto, setAberto] = useState(false);
  const [abrirParaBaixo, setAbrirParaBaixo] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const idCard = useId();
  const idTitulo = useId();

  const seguras = fontes.filter((fonte) => ehLinkSeguro(fonte.url));
  if (seguras.length === 0) return null;

  function medirEspaco() {
    const raiz = raizRef.current;
    if (!raiz) return;
    const limiteTopo = paiComRolagem(raiz)?.getBoundingClientRect().top ?? 0;
    setAbrirParaBaixo(raiz.getBoundingClientRect().top - limiteTopo < ESPACO_MINIMO_ACIMA_PX);
  }

  return (
    <div
      ref={raizRef}
      className="group relative"
      onMouseEnter={medirEspaco}
      onFocus={medirEspaco}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setAberto(false);
      }}
      onKeyDown={(evento) => {
        if (evento.key === "Escape") setAberto(false);
      }}
    >
      <button
        type="button"
        aria-label={`${seguras.length} ${seguras.length === 1 ? "fonte" : "fontes"} na web`}
        aria-expanded={aberto}
        aria-controls={idCard}
        onClick={() => {
          medirEspaco();
          setAberto((atual) => !atual);
        }}
        className="flex items-center gap-1 rounded-full bg-orange-light/15 px-2 py-0.5 text-[12px] font-bold text-orange-light transition-colors hover:bg-orange-light/25 focus-visible:bg-orange-light/25"
      >
        <Link2 size={12} aria-hidden="true" />
        {seguras.length}
      </button>
      {/* O espaçamento (pb/pt) mantém a área de hover contínua entre o chip e o card */}
      <div
        id={idCard}
        role="region"
        aria-labelledby={idTitulo}
        className={`absolute left-0 z-20 w-72 max-w-[calc(100vw-3rem)] transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${
          abrirParaBaixo ? "top-full pt-2" : "bottom-full pb-2"
        } ${aberto ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <div className="rounded-xl bg-white p-2 shadow-neo-raised">
          <h3
            id={idTitulo}
            className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray/70"
          >
            Fontes na web
          </h3>
          {seguras.map((fonte, indice) => (
            <a
              key={`${fonte.url}-${indice}`}
              href={fonte.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-lg px-2 py-2 text-charcoal transition-colors hover:bg-orange-light/10 focus-visible:bg-orange-light/10"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold">{fonte.titulo}</span>
                <span className="block truncate text-[12px] text-gray/70">{dominioDe(fonte)}</span>
              </span>
              <ExternalLink size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-gray/70" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
