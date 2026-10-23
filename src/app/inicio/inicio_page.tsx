"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { ContinueStudyingBanner } from "@/components/progresso_components/continue_studying_banner";
import { MinhaTrilhaCard } from "@/components/inicio_components/minha_trilha_card";
import { RecomendacaoTip } from "@/components/inicio_components/recomendacao_tip";
import { getSubjectColor } from "@/components/progresso_components/subject_icon";
import { getProximoModulo } from "@/lib/progresso";
import { TrilhaCaminhoPainel } from "@/components/trilha_components/trilha_caminho_painel";
import { useProgresso } from "@/hooks/use_progresso";
import { useRecomendacao } from "@/hooks/use_recomendacao";
import { useTrilhaCaminhos } from "@/hooks/use_trilha_caminhos";

export default function InicioPage() {
  const router = useRouter();
  const { materias, carregando, erro, recarregar } = useProgresso();
  const { materias: caminhos } = useTrilhaCaminhos();
  const { recomendacoes, carregando: carregandoRecomendacao } = useRecomendacao();
  const [caminhoId, setCaminhoId] = useState<string | null>(null);
  const caminho = caminhos.find((m) => m.id === caminhoId) ?? null;

  const destaque = materias
    .filter((m) => m.percentual_completo > 0 && m.percentual_completo < 100)
    .sort((a, b) => b.percentual_completo - a.percentual_completo)[0];

  // Só sugere para quem já estudou algum módulo. O `percentual_completo` da
  // matéria conta apenas temas concluídos, então um aluno com módulos
  // concluídos e o tema ainda aberto continuaria em 0% - por isso olhamos os
  // módulos, não o percentual.
  const jaEstudou = materias.some((materia) =>
    materia.temas.some((tema) =>
      tema.modulos.some((modulo) => modulo.estado === "concluido" || modulo.tentativas_count > 0)
    )
  );
  const recomendacoesParaMostrar = !carregandoRecomendacao && jaEstudou ? recomendacoes : [];

  function continuar() {
    if (!destaque) return;
    const alvo = getProximoModulo(destaque);
    router.push(alvo ? `/quiz?highlight=${alvo.moduloId}` : "/quiz");
  }

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Início" subtitle="O que estudar hoje" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Link
                href="/explorar"
                className="group flex items-center gap-4 rounded-[16px] bg-orange p-5 text-white shadow-neo-raised transition hover:bg-orange-light focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Compass size={24} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[17px] font-bold">Explorar trilhas</span>
                  <span className="block text-[12.5px] text-white/90">
                    Currículo verificado e trilhas da comunidade
                  </span>
                </span>
              </Link>
            </div>

            {carregando && <p className="text-[13px] text-gray">Carregando suas trilhas...</p>}

            {!carregando && erro && (
              <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
                <h2 className="font-display text-sm font-semibold text-charcoal">
                  Não foi possível carregar suas trilhas
                </h2>
                <button
                  type="button"
                  onClick={() => void recarregar()}
                  className="mt-3 rounded-[9px] border border-orange px-4 py-2 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!carregando && !erro && destaque && (
              <ContinueStudyingBanner
                materia={destaque}
                cor={getSubjectColor(destaque.materia_id)}
                onContinuar={continuar}
              />
            )}

            {recomendacoesParaMostrar.length > 0 && (
              <RecomendacaoTip
                recomendacoes={recomendacoesParaMostrar}
                onEstudar={(recomendacao) =>
                  router.push(`/apostilas/${recomendacao.materia_id}?modulo=${recomendacao.modulo_id}`)
                }
              />
            )}

            {!carregando && !erro && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-[15px] font-semibold text-charcoal">Minhas trilhas</h2>
                  <span className="text-[11.5px] text-gray">{materias.length} no total</span>
                </div>
                {materias.length === 0 ? (
                  <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
                    <p className="text-[13px] leading-relaxed text-gray">
                      Você ainda não está estudando nenhuma trilha. Explore as trilhas verificadas e da comunidade
                      para começar.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {materias.map((materia) => (
                      <MinhaTrilhaCard
                        key={materia.materia_id}
                        materia={materia}
                        cor={getSubjectColor(materia.materia_id)}
                        onConversar={() => router.push(`/chat?trilha=${materia.materia_id}`)}
                        onVerCaminho={() =>
                          setCaminhoId(caminhoId === materia.materia_id ? null : materia.materia_id)
                        }
                        caminhoAberto={caminhoId === materia.materia_id}
                      />
                    ))}
                  </div>
                )}
                {caminho && (
                  <div className="mt-4 rounded-[16px] bg-white p-4 shadow-neo-raised">
                    <TrilhaCaminhoPainel
                      materia={caminho}
                      onIniciarModulo={(materiaId, _temaId, moduloId) =>
                        router.push(`/apostilas/${materiaId}?modulo=${moduloId}`)
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
