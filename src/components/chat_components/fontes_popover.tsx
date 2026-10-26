"use client";

import { useId, useRef, useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import type { FonteWeb } from "@/interfaces/chat_interfaces";

interface FontesPopoverProps {
  fontes: FonteWeb[];
}

// Altura aproximada do card com 3 fontes; abaixo disso de espaço livre acima do chip, abre para baixo.
const ESPACO_MINIMO_ACIMA_PX = 240;
// Acima disso a lista ganha rolagem própria em vez de esticar o card.
const FONTES_SEM_ROLAGEM = 5;
const EXTENSAO_ARQUIVO = /\.(html?|php|aspx?|jsp|shtml)$/i;

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

/**
 * Rótulo do fim da URL (".../historiag/revolucao-francesa.htm" → "Revolucao
 * francesa"), usado quando a busca não devolveu o título da página - o backend
 * cai para o domínio nesse caso, e sem isso o card mostraria o domínio duas
 * vezes.
 */
function rotuloDoCaminho(url: string): string | null {
  try {
    const segmento = new URL(url).pathname.split("/").filter(Boolean).pop();
    if (!segmento) return null;

    const texto = decodeURIComponent(segmento.replace(EXTENSAO_ARQUIVO, ""))
      .replace(/[-_]+/g, " ")
      .trim();
    if (!texto || /^\d+$/.test(texto)) return null;

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  } catch {
    return null;
  }
}

function tituloDaFonte(fonte: FonteWeb): string {
  const dominio = dominioDe(fonte);
  const titulo = fonte.titulo?.trim();
  if (titulo && titulo !== dominio) return titulo;

  return rotuloDoCaminho(fonte.url) ?? dominio;
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

  const rolavel = seguras.length > FONTES_SEM_ROLAGEM;

  function medirEspaco() {
    const raiz = raizRef.current;
    if (!raiz) return;
    const limiteTopo = paiComRolagem(raiz)?.getBoundingClientRect().top ?? 0;
    setAbrirParaBaixo(raiz.getBoundingClientRect().top - limiteTopo < ESPACO_MINIMO_ACIMA_PX);
  }

  return (
    <div
      ref={raizRef}
      className="group flex shrink-0 items-center"
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
        className={`absolute left-0 z-20 w-72 max-w-[calc(100vw-4rem)] transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${
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
          <div className={rolavel ? "max-h-[264px] overflow-y-auto overscroll-contain" : undefined}>
            {seguras.map((fonte, indice) => {
              const titulo = tituloDaFonte(fonte);
              const dominio = dominioDe(fonte);

              return (
                <a
                  key={`${fonte.url}-${indice}`}
                  href={fonte.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 rounded-lg px-2 py-2 text-charcoal transition-colors hover:bg-orange-light/10 focus-visible:bg-orange-light/10"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{titulo}</span>
                    {titulo !== dominio && (
                      <span className="block truncate text-[12px] text-gray/70">{dominio}</span>
                    )}
                  </span>
                  <ExternalLink size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-gray/70" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
