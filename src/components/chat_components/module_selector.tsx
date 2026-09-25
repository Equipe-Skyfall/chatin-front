"use client";

import { useSyncExternalStore } from "react";
import { BookOpen } from "lucide-react";
import { DropdownSelect } from "@/components/chat_components/dropdown_select";
import type { DropdownOption } from "@/components/chat_components/dropdown_select";
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

const subscribeNada = () => () => {};

/** `false` no SSR e no primeiro render do cliente, `true` só depois de
 * hidratar - deixa o HTML inicial idêntico nos dois lados. */
function useMontado(): boolean {
  return useSyncExternalStore(
    subscribeNada,
    () => true,
    () => false
  );
}

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

  // O estado que decide `disabled` (sessão/trilha) só existe no cliente - é
  // buscado em efeito. Renderizar isso direto faz o SSR e o primeiro render do
  // cliente divergirem (erro de hidratação). O gate no mount mantém os dois
  // iguais no HTML inicial e só aplica o disabled depois de hidratar.
  const montado = useMontado();

  const opcoesMaterias: DropdownOption[] = materias.map((materia) => ({
    value: materia.id,
    label: materia.nome,
  }));

  const opcoesTemas: DropdownOption[] = temas.map((tema) => ({
    value: tema.id,
    label: tema.titulo,
    estado: tema.estado,
  }));

  const opcoesModulos: DropdownOption[] = [
    { value: "", label: "Sem módulo" },
    ...modulos.map((modulo) => ({ value: modulo.id, label: modulo.titulo, estado: modulo.estado })),
  ];

  return (
    <section className="mx-auto w-full px-4 pt-5 sm:px-7">
      <div className="rounded-xl bg-white px-4 py-4 shadow-neo-raised">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-[8px] bg-orange/10 text-orange">
            <BookOpen size={15} />
          </span>
          <h2 className="font-display text-sm font-semibold text-charcoal">Contexto do estudo</h2>
        </div>
        <p className="mt-2 text-[13px] leading-4 text-gray">
          Escolha um módulo para ancorar as respostas da IA no conteúdo dele. Você também pode conversar sem módulo.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <DropdownSelect
            label="Matéria"
            value={materiaId}
            options={opcoesMaterias}
            placeholder={carregando ? "Carregando..." : "Selecione"}
            disabled={montado && carregando}
            onChange={onSelecionarMateria}
          />
          <DropdownSelect
            label="Tema"
            value={temaId}
            options={opcoesTemas}
            placeholder="Selecione"
            disabled={montado && opcoesTemas.length === 0}
            onChange={onSelecionarTema}
          />
          <DropdownSelect
            label="Módulo"
            value={moduloId}
            options={opcoesModulos}
            placeholder="Sem módulo"
            disabled={montado && modulos.length === 0}
            onChange={(valor) => onSelecionarModulo(valor || null)}
          />
        </div>
      </div>
    </section>
  );
}
