"use client";

import { ResumoCard } from "./resumo_card";
import type { ResumoEstudoListItem } from "@/interfaces/resumo_interfaces";

const SEM_MATERIA = "Sem matéria";
const SEM_TEMA = "Sem tema";

interface GrupoTema {
  tema: string;
  itens: ResumoEstudoListItem[];
}

interface GrupoMateria {
  materia: string;
  temas: GrupoTema[];
}

function agrupar(resumos: ResumoEstudoListItem[]): GrupoMateria[] {
  const materias = new Map<string, Map<string, ResumoEstudoListItem[]>>();

  for (const resumo of resumos) {
    const materia = resumo.materia_nome || SEM_MATERIA;
    const tema = resumo.tema_titulo || SEM_TEMA;

    const temas = materias.get(materia) ?? new Map<string, ResumoEstudoListItem[]>();
    temas.set(tema, [...(temas.get(tema) ?? []), resumo]);
    materias.set(materia, temas);
  }

  return [...materias.entries()].map(([materia, temas]) => ({
    materia,
    temas: [...temas.entries()].map(([tema, itens]) => ({ tema, itens })),
  }));
}

interface ResumoListProps {
  resumos: ResumoEstudoListItem[];
  onAbrir: (id: string) => void;
}

export function ResumoList({ resumos, onAbrir }: ResumoListProps) {
  return (
    <div className="flex flex-col gap-6">
      {agrupar(resumos).map((grupo) => (
        <section key={grupo.materia} className="flex flex-col gap-3">
          <h2 className="font-display text-[15px] font-semibold text-charcoal">
            {grupo.materia}
          </h2>
          {grupo.temas.map((tema) => (
            <div key={tema.tema} className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray">
                {tema.tema}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {tema.itens.map((resumo) => (
                  <ResumoCard key={resumo.id} resumo={resumo} onAbrir={onAbrir} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
