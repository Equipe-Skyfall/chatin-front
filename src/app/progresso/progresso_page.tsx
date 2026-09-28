"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { ProgressoStats } from "@/components/progresso_components/progresso_stats";
import { ContinueStudyingBanner } from "@/components/progresso_components/continue_studying_banner";
import { MateriaGridCard } from "@/components/progresso_components/materia_grid_card";
import { MateriaDetailModal } from "@/components/progresso_components/materia_detail_modal";
import { getSubjectColor } from "@/components/progresso_components/subject_icon";
import { calcularAgregado, getProximoModulo } from "@/lib/progresso";
import { useProgresso } from "@/hooks/use_progresso";

export default function ProgressoPage() {
  const router = useRouter();
  const {
    materias,
    carregando,
    erro,
    materiaSelecionada,
    temaAbertoId,
    abrirMateria,
    fecharMateria,
    alternarTema,
    recarregar,
  } = useProgresso();

  const agregado = calcularAgregado(materias);

  const corSelecionada = materiaSelecionada ? getSubjectColor(materiaSelecionada.materia_id) : "#fb7118";

  const emAndamento = materias
    .filter((m) => m.percentual_completo > 0 && m.percentual_completo < 100)
    .sort((a, b) => b.percentual_completo - a.percentual_completo);
  const destaque = emAndamento[0];
  const corDestaque = destaque ? getSubjectColor(destaque.materia_id) : "#fb7118";

  function irParaModulo(moduloId: string) {
    router.push(`/quiz?highlight=${moduloId}`);
  }

  function continuarMateria(materia: typeof destaque) {
    if (!materia) return;
    const alvo = getProximoModulo(materia);
    if (alvo) {
      irParaModulo(alvo.moduloId);
    } else {
      router.push("/quiz");
    }
  }

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Progresso" subtitle="Seu desempenho por matéria e tópico" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          {carregando && <p className="text-[13px] text-gray">Carregando progresso...</p>}

          {!carregando && erro && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <h2 className="font-display text-sm font-semibold text-charcoal">
                Não foi possível carregar seu progresso
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-gray">
                Ocorreu um problema ao buscar seus dados. Tente novamente.
              </p>
              <button
                type="button"
                onClick={() => void recarregar()}
                className="mt-3 rounded-[9px] border border-orange px-4 py-2 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregando && !erro && materias.length === 0 && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <h2 className="font-display text-sm font-semibold text-charcoal">
                Nenhum progresso registrado ainda
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-gray">
                Comece a estudar ou responda um questionário para ver sua evolução por matéria e tópico aqui.
              </p>
            </div>
          )}

          {!carregando && !erro && materias.length > 0 && (
            <div className="grid gap-6">
              <ProgressoStats agregado={agregado} />

              {destaque && (
                <ContinueStudyingBanner
                  materia={destaque}
                  cor={corDestaque}
                  onContinuar={() => continuarMateria(destaque)}
                />
              )}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-[15px] font-semibold text-charcoal">Suas matérias</h2>
                  <span className="text-[11.5px] text-gray">{materias.length} no total</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {materias.map((materia) => (
                    <MateriaGridCard
                      key={materia.materia_id}
                      materia={materia}
                      cor={getSubjectColor(materia.materia_id)}
                      onAbrir={() => abrirMateria(materia.materia_id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <MateriaDetailModal
        materia={materiaSelecionada}
        cor={corSelecionada}
        temaAbertoId={temaAbertoId}
        onToggleTema={alternarTema}
        onClose={fecharMateria}
        onAbrirModulo={irParaModulo}
      />
    </main>
  );
}