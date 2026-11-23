"use client";

import { Activity, ArrowDownToLine, ArrowUpFromLine, TriangleAlert, type LucideIcon } from "lucide-react";
import { FiltroChips } from "@/components/explorar_components/filtro_chips";
import { useConsumoIa } from "@/hooks/use_consumo_ia";
import { PERIODOS_CONSUMO, totalTokens, type ConsumoItem } from "@/lib/ia_consumo";

const numero = (valor: number) => valor.toLocaleString("pt-BR");

function Totais({
  rotulo,
  valor,
  icone: Icone,
  classeIcone,
}: {
  rotulo: string;
  valor: number;
  icone: LucideIcon;
  classeIcone: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[14px] bg-surface p-4 shadow-neo-raised">
      <span className={`flex size-10 items-center justify-center rounded-full ${classeIcone}`}>
        <Icone size={19} aria-hidden="true" />
      </span>
      <p className="mt-3 font-display text-2xl font-bold text-charcoal">{numero(valor)}</p>
      <p className="text-[11.5px] text-gray">{rotulo}</p>
    </div>
  );
}

function TabelaConsumo({ titulo, colunaChave, itens }: { titulo: string; colunaChave: string; itens: ConsumoItem[] }) {
  const maiorUso = Math.max(1, ...itens.map(totalTokens));

  return (
    <section aria-label={titulo} className="rounded-[14px] bg-surface p-4 shadow-neo-raised">
      <h2 className="font-display text-[15px] font-semibold text-charcoal">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="mt-2 text-[13px] text-gray">Sem chamadas no período.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-gray">
                <th scope="col" className="py-2 pr-3 font-semibold">{colunaChave}</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Chamadas</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Falhas</th>
                <th scope="col" className="py-2 text-right font-semibold">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.chave} className="border-b border-line/60 last:border-0">
                  <td className="py-2 pr-3 text-charcoal">
                    <span className="block truncate">{item.rotulo ?? item.chave}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 block h-1.5 rounded-full bg-orange/70"
                      style={{ width: `${Math.max(2, (totalTokens(item) / maiorUso) * 100)}%` }}
                    />
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">{numero(item.chamadas)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{numero(item.falhas)}</td>
                  <td className="py-2 text-right tabular-nums">{numero(totalTokens(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function ConsumoIaPainel() {
  const { periodo, setPeriodo, consumo, carregando, erro, recarregar } = useConsumoIa();

  return (
    <div className="grid gap-6">
      <FiltroChips rotulo="Período" opcoes={[...PERIODOS_CONSUMO]} valor={periodo} onChange={setPeriodo} />

      {carregando && !consumo && <p className="text-[13px] text-gray">Carregando consumo...</p>}

      {erro && (
        <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
          <h2 className="font-display text-sm font-semibold text-charcoal">Não foi possível carregar o consumo</h2>
          <button
            type="button"
            onClick={() => void recarregar()}
            className="mt-3 rounded-[9px] border border-orange px-4 py-2 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!erro && consumo && (
        <div className={`grid gap-6 ${carregando ? "opacity-60" : ""}`} aria-busy={carregando}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Totais rotulo="Chamadas" valor={consumo.chamadas} icone={Activity} classeIcone="bg-orange/10 text-orange" />
            <Totais rotulo="Falhas" valor={consumo.falhas} icone={TriangleAlert} classeIcone="bg-error/10 text-error-ink" />
            <Totais rotulo="Tokens de entrada" valor={consumo.tokens_entrada} icone={ArrowDownToLine} classeIcone="bg-accent-blue/10 text-accent-blue-ink" />
            <Totais rotulo="Tokens de saída" valor={consumo.tokens_saida} icone={ArrowUpFromLine} classeIcone="bg-accent-green/10 text-accent-green-ink" />
          </div>

          <p className="text-[12px] text-gray">
            Os tokens contam só as chamadas em que o provedor informou o uso; o total real pode ser maior.
          </p>

          <TabelaConsumo titulo="Por operação" colunaChave="Operação" itens={consumo.por_operacao} />
          <TabelaConsumo titulo="Por usuário (top 10)" colunaChave="Usuário" itens={consumo.por_usuario} />
        </div>
      )}
    </div>
  );
}
