import { Trophy } from "lucide-react";
import type { Ranking, RankingEntrada } from "@/lib/xp";

interface RankingListProps {
  ranking: Ranking | null;
  carregando: boolean;
  erro: boolean;
  podeExpandir: boolean;
  onExpandir: () => void;
  onTentarNovamente: () => void;
}

function Linha({ entrada, fixa = false }: { entrada: RankingEntrada; fixa?: boolean }) {
  return (
    <li
      aria-current={entrada.eu ? "true" : undefined}
      className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] ${
        entrada.eu ? "bg-orange/10 font-semibold text-charcoal ring-1 ring-orange/40" : "text-charcoal"
      } ${fixa ? "mt-2" : ""}`}
    >
      <span className="w-8 shrink-0 font-display font-bold text-gray">{entrada.posicao}º</span>
      <span className="min-w-0 flex-1 truncate">
        {entrada.apelido}
        {entrada.eu && <span className="ml-2 text-[11px] font-semibold text-orange">você</span>}
      </span>
      <span className="shrink-0 tabular-nums">{entrada.xp.toLocaleString("pt-BR")} XP</span>
    </li>
  );
}

export function RankingList({ ranking, carregando, erro, podeExpandir, onExpandir, onTentarNovamente }: RankingListProps) {
  const entradas = ranking?.entradas ?? [];
  const minha = ranking?.minha_posicao ?? null;
  const euForaDaLista = minha !== null && !entradas.some((entrada) => entrada.eu);

  return (
    <section aria-label="Ranking" className="rounded-[14px] bg-white p-4 shadow-neo-raised">
      <div className="mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-orange" aria-hidden="true" />
        <h2 className="font-display text-[15px] font-semibold text-charcoal">Ranking</h2>
        <span className="text-[11.5px] text-gray">por XP</span>
      </div>

      {carregando && !ranking && <p className="text-[13px] text-gray">Carregando ranking...</p>}

      {erro && (
        <div className="text-[13px] text-gray">
          <p>Não foi possível carregar o ranking.</p>
          <button
            type="button"
            onClick={onTentarNovamente}
            className="mt-2 rounded-[9px] border border-orange px-3 py-1.5 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!erro && ranking && entradas.length === 0 && (
        <p className="text-[13px] text-gray">Ainda ninguém tem XP. Responda um questionário para abrir o ranking.</p>
      )}

      {!erro && entradas.length > 0 && (
        <>
          <ol className="grid gap-1">
            {entradas.map((entrada) => (
              <Linha key={entrada.posicao} entrada={entrada} />
            ))}
          </ol>
          {euForaDaLista && minha && (
            <ol aria-label="Sua posição">
              <Linha entrada={minha} fixa />
            </ol>
          )}
          {podeExpandir && (
            <button
              type="button"
              onClick={onExpandir}
              disabled={carregando}
              className="mt-3 rounded-[9px] border border-line px-3 py-1.5 text-[12px] font-semibold text-charcoal transition-colors hover:bg-surface disabled:opacity-60"
            >
              Ver mais
            </button>
          )}
        </>
      )}
    </section>
  );
}
