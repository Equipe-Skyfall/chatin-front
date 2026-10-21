"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui_components/modal";
import { CotaTrilhasInfo } from "@/components/explorar_components/cota_trilhas";
import {
  TextAreaField,
  TextField,
  ghostButtonClassName,
  primaryButtonClassName,
} from "@/components/admin_components/form_field";
import { ApiError } from "@/lib/api";
import { criarTrilha } from "@/lib/trilhas";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import { CODIGO_LIMITE_TRILHAS, type CotaTrilhas } from "@/interfaces/trilha_interfaces";

interface CriarTrilhaModalProps {
  open: boolean;
  cota: CotaTrilhas | null;
  onClose: () => void;
  /** A trilha foi criada (a geração dos módulos continua em segundo plano). */
  onCriada: () => void;
  /** O back barrou por limite mensal: a cota precisa ser relida. */
  onLimite: () => void;
}

export function CriarTrilhaModal({ open, cota, onClose, onCriada, onLimite }: CriarTrilhaModalProps) {
  const tratarErro = useStudyErrorHandler();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [temaTitulo, setTemaTitulo] = useState("");
  const [direcionamento, setDirecionamento] = useState("");
  const [salvando, setSalvando] = useState(false);

  const esgotada = cota !== null && cota.restantes === 0;
  const valido = nome.trim().length >= 2 && temaTitulo.trim().length >= 3;

  function fechar() {
    if (salvando) return;
    onClose();
  }

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!valido || esgotada || salvando) return;

    setSalvando(true);
    try {
      await criarTrilha({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        tema_titulo: temaTitulo.trim(),
        direcionamento: direcionamento.trim() || null,
      });
      toast.success("Trilha criada! A IA está gerando os módulos, isso leva alguns minutos.");
      setNome("");
      setDescricao("");
      setTemaTitulo("");
      setDirecionamento("");
      onCriada();
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === CODIGO_LIMITE_TRILHAS) {
        toast.error(error.detail ?? error.message);
        onLimite();
      } else {
        void tratarErro(error, { ia: true });
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Criar trilha"
      onClose={fechar}
      footer={
        <>
          <button type="button" onClick={fechar} disabled={salvando} className={`${ghostButtonClassName} !w-auto px-4 !text-[12px]`}>
            Cancelar
          </button>
          <button
            type="submit"
            form="criar-trilha-form"
            disabled={!valido || esgotada || salvando}
            className={`${primaryButtonClassName} !w-auto px-4 !text-[12px]`}
          >
            {salvando ? "Criando..." : "Criar trilha"}
          </button>
        </>
      }
    >
      <form id="criar-trilha-form" onSubmit={enviar} className="grid gap-3">
        <CotaTrilhasInfo cota={cota} />
        {esgotada && (
          <p role="alert" className="rounded-[8px] bg-error/10 px-3 py-2 text-[12px] text-error-ink">
            Você já usou todas as trilhas deste mês. Volte quando a cota renovar.
          </p>
        )}
        <TextField
          label="Nome da trilha"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Química Orgânica"
          maxLength={200}
          required
          disabled={esgotada || salvando}
        />
        <TextAreaField
          label="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          disabled={esgotada || salvando}
        />
        <TextField
          label="Primeiro tema"
          value={temaTitulo}
          onChange={(e) => setTemaTitulo(e.target.value)}
          placeholder="Ex.: Hidrocarbonetos"
          maxLength={200}
          required
          disabled={esgotada || salvando}
        />
        <TextAreaField
          label="Direcionamento para a IA (opcional)"
          value={direcionamento}
          onChange={(e) => setDirecionamento(e.target.value)}
          rows={2}
          placeholder="Nível, foco, exemplos..."
          disabled={esgotada || salvando}
        />
      </form>
    </Modal>
  );
}
