"use client";

import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { MateriaProgressoCard } from "@/components/progresso_components/materia_progresso_card";
import { useProgresso } from "@/hooks/use_progresso";

export default function ProgressoPage() {
  const { progresso, carregando } = useProgresso();

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Progresso" subtitle="Seu avanço por matéria" />
        <div className="mx-auto w-full max-w-[720px] flex-1 px-4 py-6 sm:px-7">
          {carregando && <p className="text-[13px] text-gray">Carregando progresso...</p>}

          {!carregando && (!progresso || progresso.materias.length === 0) && (
            <div className="rounded-xl bg-surface p-6 text-center shadow-neo-raised">
              <p className="text-sm text-gray">
                Nenhuma matéria disponível ainda. Comece um módulo pra acompanhar seu progresso aqui.
              </p>
            </div>
          )}

          {!carregando && progresso && progresso.materias.length > 0 && (
            <div className="flex flex-col gap-4">
              {progresso.materias.map((materia) => (
                <MateriaProgressoCard key={materia.materia_id} materia={materia} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
