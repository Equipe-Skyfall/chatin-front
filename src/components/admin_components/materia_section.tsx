"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { ConfirmDeleteButton } from "./confirm_delete_button";
import {
  TextAreaField,
  TextField,
  ghostButtonClassName,
  iconButtonClassName,
  primaryButtonClassName,
} from "./form_field";
import type { Materia, MateriaInput } from "@/interfaces/content_interfaces";

interface MateriaSectionProps {
  materias: Materia[];
  materiaAtual: Materia | null;
  carregando: boolean;
  ocupado: boolean;
  onSelecionar: (id: string) => void;
  onCriar: (input: MateriaInput) => void;
  onAtualizar: (id: string, input: MateriaInput) => void;
  onExcluir: (id: string) => void;
}

interface MateriaFormProps {
  titulo: string;
  inicial?: Materia;
  ocupado: boolean;
  onSalvar: (input: MateriaInput) => void;
  onCancelar?: () => void;
  onExcluir?: () => void;
}

function MateriaForm({ titulo, inicial, ocupado, onSalvar, onCancelar, onExcluir }: MateriaFormProps) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nome.trim().length < 2) return;
    onSalvar({ nome: nome.trim(), descricao: descricao.trim() || null });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 border-t border-line px-3 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray">{titulo}</p>
      <TextField
        label="Nome"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        disabled={ocupado}
        placeholder="Ex.: Matemática"
        minLength={2}
        maxLength={200}
        required
      />
      <TextAreaField
        label="Descrição"
        value={descricao}
        onChange={(event) => setDescricao(event.target.value)}
        disabled={ocupado}
        rows={2}
        placeholder="Opcional"
      />
      <div className="flex items-center gap-2 justify-between">
        <button type="submit" disabled={ocupado} className={primaryButtonClassName}>
          Salvar
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className={ghostButtonClassName}>
            Cancelar
          </button>
        )}
        {onExcluir && <ConfirmDeleteButton onConfirm={onExcluir} disabled={ocupado} />}
      </div>
    </form>
  );
}

export function MateriaSection({
  materias,
  materiaAtual,
  carregando,
  ocupado,
  onSelecionar,
  onCriar,
  onAtualizar,
  onExcluir,
}: MateriaSectionProps) {
  const [criando, setCriando] = useState(false);

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-xs font-semibold text-charcoal">
          Matérias <span className="ml-1 text-[10px] font-normal text-gray">{materias.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => setCriando((atual) => !atual)}
          disabled={ocupado}
          aria-label="Nova matéria"
          className={iconButtonClassName}
        >
          <Plus size={14} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {carregando && <p className="px-2 py-2 text-[10px] text-gray">Carregando matérias...</p>}
        {!carregando && materias.length === 0 && (
          <p className="px-2 py-2 text-[10px] leading-4 text-gray">Nenhuma matéria cadastrada.</p>
        )}
        <div className="flex flex-col gap-1">
          {materias.map((materia) => {
            const ativa = materia.id === materiaAtual?.id;

            return (
              <button
                key={materia.id}
                type="button"
                onClick={() => onSelecionar(materia.id)}
                aria-current={ativa ? "true" : undefined}
                className={`rounded-[9px] px-3 py-2 text-left text-[11px] font-semibold transition-colors ${
                  ativa ? "bg-orange/10 text-orange" : "text-charcoal hover:bg-surface"
                }`}
              >
                {materia.nome}
              </button>
            );
          })}
        </div>
      </div>

      {criando && (
        <MateriaForm
          titulo="Nova matéria"
          ocupado={ocupado}
          onCancelar={() => setCriando(false)}
          onSalvar={(input) => {
            onCriar(input);
            setCriando(false);
          }}
        />
      )}

      {!criando && materiaAtual && (
        <MateriaForm
          key={materiaAtual.id}
          titulo="Matéria selecionada"
          inicial={materiaAtual}
          ocupado={ocupado}
          onSalvar={(input) => onAtualizar(materiaAtual.id, input)}
          onExcluir={() => onExcluir(materiaAtual.id)}
        />
      )}
    </section>
  );
}
