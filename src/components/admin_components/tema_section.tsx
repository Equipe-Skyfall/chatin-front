"use client";

import { useState, type FormEvent } from "react";
import { Plus, Sparkles } from "lucide-react";
import { ConfirmDeleteButton } from "./confirm_delete_button";
import {
  TextAreaField,
  TextField,
  ghostButtonClassName,
  iconButtonClassName,
  primaryButtonClassName,
} from "./form_field";
import type { Tema, TemaInput } from "@/interfaces/content_interfaces";

interface TemaSectionProps {
  temas: Tema[];
  temaAtual: Tema | null;
  materiaSelecionada: string | null;
  carregando: boolean;
  ocupado: boolean;
  onSelecionar: (id: string) => void;
  onCriar: (input: TemaInput) => void;
  onAtualizar: (id: string, input: TemaInput) => void;
  onExcluir: (id: string) => void;
  onRegenerar: (id: string) => void;
}

interface TemaFormProps {
  titulo: string;
  inicial?: Tema;
  ocupado: boolean;
  onSalvar: (input: TemaInput) => void;
  onCancelar?: () => void;
  onExcluir?: () => void;
  onRegenerar?: () => void;
}

function TemaForm({ titulo, inicial, ocupado, onSalvar, onCancelar, onExcluir, onRegenerar }: TemaFormProps) {
  const [tituloTema, setTituloTema] = useState(inicial?.titulo ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [direcionamento, setDirecionamento] = useState(inicial?.direcionamento ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tituloTema.trim().length < 3) return;
    onSalvar({
      titulo: tituloTema.trim(),
      descricao: descricao.trim() || null,
      direcionamento: direcionamento.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 border-t border-line px-3 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray">{titulo}</p>
      <TextField
        label="Título"
        value={tituloTema}
        onChange={(event) => setTituloTema(event.target.value)}
        disabled={ocupado}
        placeholder="Ex.: Funções do primeiro grau"
        minLength={3}
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
      <TextAreaField
        label="Direcionamento para a IA"
        value={direcionamento}
        onChange={(event) => setDirecionamento(event.target.value)}
        disabled={ocupado}
        rows={2}
        placeholder="Estilo, profundidade, exemplos..."
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={ocupado} className={primaryButtonClassName}>
          Salvar
        </button>
        {onRegenerar && (
          <button
            type="button"
            onClick={onRegenerar}
            disabled={ocupado}
            title="Regera este tema com IA a partir dos dados atuais"
            className={ghostButtonClassName}
          >
            Regenerar com IA
          </button>
        )}
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

export function TemaSection({
  temas,
  temaAtual,
  materiaSelecionada,
  carregando,
  ocupado,
  onSelecionar,
  onCriar,
  onAtualizar,
  onExcluir,
  onRegenerar,
}: TemaSectionProps) {
  const [criando, setCriando] = useState(false);

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-xs font-semibold text-charcoal">
          Temas <span className="ml-1 text-[10px] font-normal text-gray">{materiaSelecionada ? temas.length : "-"}</span>
        </h2>
        <button
          type="button"
          onClick={() => setCriando((atual) => !atual)}
          disabled={ocupado || !materiaSelecionada}
          aria-label="Novo tema"
          title={materiaSelecionada ? "Novo tema" : "Selecione uma matéria primeiro"}
          className={iconButtonClassName}
        >
          <Plus size={14} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {!materiaSelecionada && (
          <p className="px-2 py-2 text-[10px] leading-4 text-gray">Selecione uma matéria para ver os temas.</p>
        )}
        {materiaSelecionada && carregando && <p className="px-2 py-2 text-[10px] text-gray">Carregando temas...</p>}
        {materiaSelecionada && !carregando && temas.length === 0 && (
          <p className="px-2 py-2 text-[10px] leading-4 text-gray">Nenhum tema nesta matéria.</p>
        )}
        <div className="flex flex-col gap-1">
          {temas.map((tema) => {
            const ativo = tema.id === temaAtual?.id;

            return (
              <button
                key={tema.id}
                type="button"
                onClick={() => onSelecionar(tema.id)}
                aria-current={ativo ? "true" : undefined}
                className={`flex w-full flex-col gap-0.5 rounded-[9px] px-3 py-2 text-left transition-colors ${
                  ativo ? "bg-orange/10" : "hover:bg-surface"
                }`}
              >
                <span className={`text-[11px] font-semibold ${ativo ? "text-orange" : "text-charcoal"}`}>{tema.titulo}</span>
                <span className="text-[9px] text-gray/70">
                  ordem {tema.ordem} · {tema.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {criando && materiaSelecionada && (
        <TemaForm
          titulo="Novo tema"
          ocupado={ocupado}
          onCancelar={() => setCriando(false)}
          onSalvar={(input) => {
            onCriar(input);
            setCriando(false);
          }}
        />
      )}

      {!criando && temaAtual && (
        <TemaForm
          key={temaAtual.id}
          titulo="Tema selecionado"
          inicial={temaAtual}
          ocupado={ocupado}
          onSalvar={(input) => onAtualizar(temaAtual.id, input)}
          onExcluir={() => onExcluir(temaAtual.id)}
          onRegenerar={() => onRegenerar(temaAtual.id)}
        />
      )}

      {!criando && !temaAtual && materiaSelecionada && (
        <p className="flex items-center gap-1.5 border-t border-line px-3 py-3 text-[10px] text-gray">
          <Sparkles size={12} className="text-orange" />
          Selecione um tema para editar ou regenerar.
        </p>
      )}
    </section>
  );
}
