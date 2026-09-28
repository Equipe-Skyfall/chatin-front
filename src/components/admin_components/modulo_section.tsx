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
import type { Modulo, ModuloInput, ModuloUpdateInput } from "@/interfaces/content_interfaces";

interface ModuloSectionProps {
  modulos: Modulo[];
  moduloAtual: Modulo | null;
  temaSelecionado: string | null;
  carregando: boolean;
  gerando: boolean;
  ocupado: boolean;
  onSelecionar: (id: string) => void;
  onCriar: (input: ModuloInput) => void;
  onGerar: () => void;
  onAtualizar: (id: string, input: ModuloUpdateInput) => void;
  onExcluir: (id: string) => void;
  onRegenerar: (id: string, instrucoes?: string | null) => void;
  onRegenerarQuestionario: (id: string) => void;
}

interface ModuloFormProps {
  titulo: string;
  inicial?: Modulo;
  ocupado: boolean;
  onSalvar: (input: ModuloInput & ModuloUpdateInput) => void;
  onCancelar?: () => void;
  onExcluir?: () => void;
  onRegenerar?: (instrucoes: string | null) => void;
  onRegenerarQuestionario?: () => void;
}

function ModuloForm({
  titulo,
  inicial,
  ocupado,
  onSalvar,
  onCancelar,
  onExcluir,
  onRegenerar,
  onRegenerarQuestionario,
}: ModuloFormProps) {
  const [tituloModulo, setTituloModulo] = useState(inicial?.titulo ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [conteudo, setConteudo] = useState("");
  const [ordem, setOrdem] = useState(String(inicial?.ordem ?? 0));
  const [instrucoes, setInstrucoes] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tituloModulo.trim().length < 3) return;

    const payload: ModuloInput & ModuloUpdateInput = {
      titulo: tituloModulo.trim(),
      descricao: descricao.trim() || null,
    };

    if (inicial) {
      payload.ordem = Number(ordem) || 0;
    } else {
      payload.conteudo = conteudo.trim() || null;
    }

    onSalvar(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 border-t border-line px-3 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray">{titulo}</p>
      <TextField
        label="Título"
        value={tituloModulo}
        onChange={(event) => setTituloModulo(event.target.value)}
        disabled={ocupado}
        placeholder="Ex.: Introdução às funções"
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
      {inicial ? (
        <TextField
          label="Ordem"
          type="number"
          min={0}
          value={ordem}
          onChange={(event) => setOrdem(event.target.value)}
          disabled={ocupado}
        />
      ) : (
        <TextAreaField
          label="Conteúdo (opcional)"
          value={conteudo}
          onChange={(event) => setConteudo(event.target.value)}
          disabled={ocupado}
          rows={4}
          placeholder="Se preenchido, a IA não gera o conteúdo — só o questionário."
        />
      )}

      {onRegenerar && (
        <TextAreaField
          label="Instruções de regeneração (opcional)"
          value={instrucoes}
          onChange={(event) => setInstrucoes(event.target.value)}
          disabled={ocupado}
          rows={2}
          placeholder="Ex.: deixe mais curto, adicione mais exemplos"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={ocupado} className={primaryButtonClassName}>
          Salvar
        </button>
        {onRegenerar && (
          <button
            type="button"
            onClick={() => onRegenerar(instrucoes.trim() || null)}
            disabled={ocupado}
            title="Regera este módulo com IA (uma chamada por módulo)"
            className={ghostButtonClassName}
          >
            Regenerar com IA
          </button>
        )}
        {onRegenerarQuestionario && (
          <button
            type="button"
            onClick={onRegenerarQuestionario}
            disabled={ocupado}
            title="Refaz apenas o questionário a partir do conteúdo atual"
            className={ghostButtonClassName}
          >
            Refazer questionário
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

export function ModuloSection({
  modulos,
  moduloAtual,
  temaSelecionado,
  carregando,
  gerando,
  ocupado,
  onSelecionar,
  onCriar,
  onGerar,
  onAtualizar,
  onExcluir,
  onRegenerar,
  onRegenerarQuestionario,
}: ModuloSectionProps) {
  const [criando, setCriando] = useState(false);
  const jaTemModulos = modulos.length > 0;

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-xs font-semibold text-charcoal">
          Módulos <span className="ml-1 text-[10px] font-normal text-gray">{temaSelecionado ? modulos.length : "-"}</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onGerar}
            disabled={ocupado || !temaSelecionado || jaTemModulos}
            aria-label="Gerar módulos com IA"
            title={
              jaTemModulos
                ? "Só funciona em tema sem módulos"
                : temaSelecionado
                  ? "Divide o tema em até 5 módulos com IA"
                  : "Selecione um tema primeiro"
            }
            className={iconButtonClassName}
          >
            <Sparkles size={14} />
          </button>
          <button
            type="button"
            onClick={() => setCriando((atual) => !atual)}
            disabled={ocupado || !temaSelecionado}
            aria-label="Novo módulo manual"
            title={temaSelecionado ? "Novo módulo manual" : "Selecione um tema primeiro"}
            className={iconButtonClassName}
          >
            <Plus size={14} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {!temaSelecionado && (
          <p className="px-2 py-2 text-[10px] leading-4 text-gray">Selecione um tema para ver os módulos.</p>
        )}
        {temaSelecionado && carregando && <p className="px-2 py-2 text-[10px] text-gray">Carregando módulos...</p>}
        {temaSelecionado && !carregando && gerando && (
          <p className="px-2 py-2 text-[10px] leading-4 text-orange">
            Gerando módulos com IA... eles aparecem aqui conforme são criados.
          </p>
        )}
        {temaSelecionado && !carregando && !gerando && modulos.length === 0 && (
          <p className="px-2 py-2 text-[10px] leading-4 text-gray">
            Nenhum módulo neste tema. Use &ldquo;Gerar com IA&rdquo; ou crie um manual.
          </p>
        )}
        <div className="flex flex-col gap-1">
          {modulos.map((modulo) => {
            const ativo = modulo.id === moduloAtual?.id;

            return (
              <button
                key={modulo.id}
                type="button"
                onClick={() => onSelecionar(modulo.id)}
                aria-current={ativo ? "true" : undefined}
                className={`flex w-full flex-col gap-0.5 rounded-[9px] px-3 py-2 text-left transition-colors ${
                  ativo ? "bg-orange/10" : "hover:bg-surface"
                }`}
              >
                <span className={`text-[11px] font-semibold ${ativo ? "text-orange" : "text-charcoal"}`}>{modulo.titulo}</span>
                <span className="text-[9px] text-gray/70">
                  ordem {modulo.ordem} · {modulo.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {criando && temaSelecionado && (
        <ModuloForm
          titulo="Novo módulo manual"
          ocupado={ocupado}
          onCancelar={() => setCriando(false)}
          onSalvar={(input) => {
            onCriar(input);
            setCriando(false);
          }}
        />
      )}

      {!criando && moduloAtual && (
        <ModuloForm
          key={moduloAtual.id}
          titulo="Módulo selecionado"
          inicial={moduloAtual}
          ocupado={ocupado}
          onSalvar={(input) => onAtualizar(moduloAtual.id, input)}
          onExcluir={() => onExcluir(moduloAtual.id)}
          onRegenerar={(instrucoes) => onRegenerar(moduloAtual.id, instrucoes)}
          onRegenerarQuestionario={() => onRegenerarQuestionario(moduloAtual.id)}
        />
      )}
    </section>
  );
}
