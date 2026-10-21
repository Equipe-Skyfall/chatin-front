"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { FiltroChips } from "@/components/explorar_components/filtro_chips";
import { TrilhaExplorarCard } from "@/components/explorar_components/trilha_explorar_card";
import { TrilhaDetalheModal } from "@/components/explorar_components/trilha_detalhe_modal";
import { CriarTrilhaModal } from "@/components/explorar_components/criar_trilha_modal";
import { CotaTrilhasInfo } from "@/components/explorar_components/cota_trilhas";
import { useExplorarTrilhas } from "@/hooks/use_explorar_trilhas";
import { useCotaTrilhas } from "@/hooks/use_cota_trilhas";
import type { OrdemTrilha, OrigemTrilha } from "@/interfaces/trilha_interfaces";

const ORIGENS: { valor: OrigemTrilha; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "verificadas", label: "Verificadas" },
  { valor: "comunidade", label: "Comunidade" },
];

const ORDENS: { valor: OrdemTrilha; label: string }[] = [
  { valor: "votos", label: "Mais votadas" },
  { valor: "alunos", label: "Mais alunos" },
  { valor: "recentes", label: "Recentes" },
];

export default function ExplorarPage() {
  const explorar = useExplorarTrilhas();
  const { cota, esgotada, recarregar: recarregarCota } = useCotaTrilhas();
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  const aberta = explorar.trilhas.find((t) => t.id === abertaId) ?? null;

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Explorar trilhas" subtitle="Currículo verificado e trilhas da comunidade" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-3">
              <FiltroChips rotulo="Origem" opcoes={ORIGENS} valor={explorar.origem} onChange={explorar.setOrigem} />
              <FiltroChips rotulo="Ordenar" opcoes={ORDENS} valor={explorar.ordem} onChange={explorar.setOrdem} />
            </div>
            <div className="grid w-full max-w-xs gap-2 sm:w-auto">
              <CotaTrilhasInfo cota={cota} />
              <button
                type="button"
                onClick={() => setCriando(true)}
                disabled={esgotada}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-orange px-5 py-2 text-[13px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none active:shadow-neo-inset-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={15} aria-hidden="true" />
                Criar trilha
              </button>
            </div>
          </div>

          {explorar.carregando && <p className="text-[13px] text-gray">Carregando trilhas...</p>}

          {!explorar.carregando && explorar.erro && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <h2 className="font-display text-sm font-semibold text-charcoal">
                Não foi possível carregar as trilhas
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-gray">
                Ocorreu um problema ao buscar as trilhas. Tente novamente.
              </p>
              <button
                type="button"
                onClick={() => void explorar.carregar()}
                className="mt-3 rounded-[9px] border border-orange px-4 py-2 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!explorar.carregando && !explorar.erro && explorar.trilhas.length === 0 && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <h2 className="font-display text-sm font-semibold text-charcoal">Nenhuma trilha por aqui ainda</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-gray">
                Mude o filtro ou crie a primeira trilha desta categoria.
              </p>
            </div>
          )}

          {!explorar.carregando && !explorar.erro && explorar.trilhas.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {explorar.trilhas.map((trilha) => (
                  <TrilhaExplorarCard key={trilha.id} trilha={trilha} onAbrir={() => setAbertaId(trilha.id)} />
                ))}
              </div>
              {explorar.temMais && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void explorar.carregarMais()}
                    disabled={explorar.carregandoMais}
                    className="rounded-[9px] border border-orange px-4 py-2 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10 disabled:opacity-50"
                  >
                    {explorar.carregandoMais ? "Carregando..." : "Carregar mais"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <TrilhaDetalheModal
        trilha={aberta}
        ocupada={explorar.ocupadaId === aberta?.id}
        onClose={() => setAbertaId(null)}
        onEstudar={(t) => void explorar.estudar(t)}
        onPararDeEstudar={(t) => void explorar.pararDeEstudar(t)}
        onVotar={(t, valor) => void explorar.votar(t, valor)}
      />
      <CriarTrilhaModal
        open={criando}
        cota={cota}
        onClose={() => setCriando(false)}
        onCriada={() => {
          void recarregarCota();
          void explorar.carregar();
        }}
        onLimite={() => void recarregarCota()}
      />
    </main>
  );
}
