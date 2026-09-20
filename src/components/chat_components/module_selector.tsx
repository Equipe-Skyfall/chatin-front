"use client";

import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

interface ModuleSelectorProps {
  materias: TrilhaMateria[];
  materiaId: string | null;
  temaId: string | null;
  moduloId: string | null;
  carregando: boolean;
  onSelecionarMateria: (id: string) => void;
  onSelecionarTema: (id: string) => void;
  onSelecionarModulo: (id: string | null) => void;
}

const selectClassName =
  "h-9 w-full rounded-[8px] border border-line bg-white px-2 text-[15px] text-charcoal outline-none transition focus:border-orange disabled:opacity-50";
const labelClassName = "text-[9px] font-bold uppercase tracking-[0.14em] text-gray";

export function ModuleSelector({
  materias,
  materiaId,
  temaId,
  moduloId,
  carregando,
  onSelecionarMateria,
  onSelecionarTema,
  onSelecionarModulo,
}: ModuleSelectorProps) {
  const temas = materias.find((materia) => materia.id === materiaId)?.temas ?? [];
  const modulos = temas.find((tema) => tema.id === temaId)?.modulos ?? [];

  return (
    <section className="mx-auto w-full  px-4 pt-5 sm:px-7">
      <div className="rounded-xl border border-line bg-white px-4 py-4">
        <h2 className="font-display text-s font-semibold text-charcoal">Contexto do estudo</h2>
        <p className="mt-1 text-[13px] leading-4 text-gray">
          Escolha um módulo para ancorar as respostas da IA no conteúdo dele. Você também pode conversar sem módulo.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1">
            <span className={labelClassName}>Matéria</span>
            <select
              className={selectClassName}
              value={materiaId ?? ""}
              disabled={carregando}
              onChange={(event) => onSelecionarMateria(event.target.value)}
            >
              <option value="" disabled>
                {carregando ? "Carregando..." : "Selecione"}
              </option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className={labelClassName}>Tema</span>
            <select
              className={selectClassName}
              value={temaId ?? ""}
              disabled={temas.length === 0}
              onChange={(event) => onSelecionarTema(event.target.value)}
            >
              <option value="" disabled>
                Selecione
              </option>
              {temas.map((tema) => (
                <option key={tema.id} value={tema.id}>
                  {tema.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className={labelClassName}>Módulo</span>
            <select
              className={selectClassName}
              value={moduloId ?? ""}
              disabled={modulos.length === 0}
              onChange={(event) => onSelecionarModulo(event.target.value || null)}
            >
              <option value="">Sem módulo</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id} disabled={modulo.estado === "bloqueado"}>
                  {modulo.titulo}
                  {modulo.estado === "bloqueado" ? " (bloqueado)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
