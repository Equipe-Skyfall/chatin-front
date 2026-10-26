"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui_components/modal";
import { CotaTrilhasInfo } from "@/components/explorar_components/cota_trilhas";
import { TrilhaSimilaresLista } from "@/components/explorar_components/trilha_similares_lista";
import {
  TextAreaField,
  TextField,
  ghostButtonClassName,
  primaryButtonClassName,
} from "@/components/admin_components/form_field";
import { ApiError } from "@/lib/api";
import { criarTrilha, estudarTrilha, verificarTrilha } from "@/lib/trilhas";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import {
  CODIGO_LIMITE_TRILHAS,
  type CotaTrilhas,
  type TrilhaSimilar,
  type VerificacaoTrilha,
} from "@/interfaces/trilha_interfaces";

interface CriarTrilhaModalProps {
  open: boolean;
  cota: CotaTrilhas | null;
  onClose: () => void;
  /** A trilha foi criada (a geração dos módulos continua em segundo plano). */
  onCriada: () => void;
  /** O back barrou por limite mensal: a cota precisa ser relida. */
  onLimite: () => void;
  /** O aluno preferiu uma trilha que já existe (já foi adicionada aos estudos). */
  onUsada: (trilha: TrilhaSimilar) => void;
}

export function CriarTrilhaModal({ open, cota, onClose, onCriada, onLimite, onUsada }: CriarTrilhaModalProps) {
  const tratarErro = useStudyErrorHandler();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [temaTitulo, setTemaTitulo] = useState("");
  const [direcionamento, setDirecionamento] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [verificacao, setVerificacao] = useState<VerificacaoTrilha | null>(null);
  const [usandoId, setUsandoId] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  const esgotada = cota !== null && cota.restantes === 0;
  const valido = nome.trim().length >= 2 && temaTitulo.trim().length >= 3;

  function fechar() {
    if (salvando || usandoId !== null) return;
    setVerificacao(null);
    onClose();
  }

  function limpar() {
    setNome("");
    setDescricao("");
    setTemaTitulo("");
    setDirecionamento("");
    setVerificacao(null);
  }

  async function criar(nomeFinal: string) {
    setSalvando(true);
    try {
      await criarTrilha({
        nome: nomeFinal,
        descricao: descricao.trim() || null,
        tema_titulo: temaTitulo.trim(),
        direcionamento: direcionamento.trim() || null,
      });
      toast.success("Trilha criada! A IA está gerando os módulos, isso leva alguns minutos.");
      limpar();
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

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!valido || esgotada || salvando) return;

    setSalvando(true);
    setVerificando(true);
    let nomeFinal = nome.trim();
    try {
      const resultado = await verificarTrilha(nomeFinal, descricao.trim() || null);
      nomeFinal = resultado.nome_normalizado || nomeFinal;
      if (resultado.status !== "nova" && resultado.similares.length > 0) {
        setVerificacao(resultado);
        setSalvando(false);
        return;
      }
    } catch {
      // A verificação é só um aviso: se falhar, a criação segue normalmente.
    } finally {
      setVerificando(false);
    }
    await criar(nomeFinal);
  }

  async function usar(trilha: TrilhaSimilar) {
    setUsandoId(trilha.id);
    try {
      if (!trilha.estudando) await estudarTrilha(trilha.id);
      toast.success("Trilha adicionada aos seus estudos.");
      limpar();
      onUsada(trilha);
      onClose();
    } catch (error) {
      void tratarErro(error);
    } finally {
      setUsandoId(null);
    }
  }

  return (
    <Modal
      open={open}
      title="Criar trilha"
      onClose={fechar}
      footer={
        verificacao ? (
          <button
            type="button"
            onClick={() => setVerificacao(null)}
            disabled={salvando || usandoId !== null}
            className={`${ghostButtonClassName} !w-auto px-4 !text-[12px]`}
          >
            Voltar
          </button>
        ) : (
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
              {salvando ? (verificando ? "Verificando..." : "Criando...") : "Criar trilha"}
            </button>
          </>
        )
      }
    >
      {verificacao ? (
        <div className="grid gap-3">
          <p className="text-[12px] text-charcoal">
            {verificacao.status === "igual"
              ? "Já existe uma trilha igual a esta. Use a que já existe e não gaste uma das suas trilhas do mês."
              : "Encontramos trilhas parecidas com a que você quer criar. Usar uma delas não gasta uma das suas trilhas do mês."}
          </p>
          <TrilhaSimilaresLista trilhas={verificacao.similares} usandoId={usandoId} onUsar={(t) => void usar(t)} />
          <div className="grid gap-2 border-t border-line pt-3">
            <p className="text-[11px] text-gray">
              Vamos criar como: <strong className="text-charcoal">{verificacao.nome_normalizado}</strong>
            </p>
            <button
              type="button"
              onClick={() => void criar(verificacao.nome_normalizado)}
              disabled={salvando || usandoId !== null}
              className={`${ghostButtonClassName} !w-auto self-start px-4 !text-[12px]`}
            >
              {salvando
                ? "Criando..."
                : cota?.limite === null
                  ? "Criar mesmo assim"
                  : "Criar mesmo assim (gasta 1 crédito)"}
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </Modal>
  );
}
