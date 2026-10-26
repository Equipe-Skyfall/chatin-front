"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { Modal } from "@/components/ui_components/modal";
import { TrilhaOrigemBadge } from "@/components/explorar_components/trilha_origem_badge";
import { primaryButtonClassName, ghostButtonClassName } from "@/components/admin_components/form_field";
import { obterTrilhaDetalhe } from "@/lib/trilhas";
import type { TrilhaDetalhe, TrilhaExplorar, VotoTrilha } from "@/interfaces/trilha_interfaces";

interface TrilhaDetalheModalProps {
  /** A trilha do cartão (com estudando/votos já atualizados pela lista). */
  trilha: TrilhaExplorar | null;
  ocupada: boolean;
  onClose: () => void;
  onEstudar: (trilha: TrilhaExplorar) => void;
  onPararDeEstudar: (trilha: TrilhaExplorar) => void;
  onVotar: (trilha: TrilhaExplorar, valor: VotoTrilha) => void;
  /** Abre o chat já na trilha (verificadas, próprias e as que o aluno estuda). */
  onConversar: (trilha: TrilhaExplorar) => void;
}

export function TrilhaDetalheModal({
  trilha,
  ocupada,
  onClose,
  onEstudar,
  onPararDeEstudar,
  onVotar,
  onConversar,
}: TrilhaDetalheModalProps) {
  const id = trilha?.id ?? null;
  const [detalhe, setDetalhe] = useState<TrilhaDetalhe | null>(null);
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao abrir, padrão já usado no restante do app
    setCarregando(true);
    setErro(false);
    setDetalhe(null);
    obterTrilhaDetalhe(id)
      .then((d) => {
        if (ativo) setDetalhe(d);
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  const aberta = trilha !== null;

  return (
    <Modal open={aberta} title={trilha?.nome ?? "Trilha"} onClose={onClose} size="lg">
      {trilha && (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <TrilhaOrigemBadge verificada={trilha.verificada} />
            <span className="text-[11.5px] text-gray">
              {trilha.verificada ? "Currículo oficial" : `por ${trilha.autor_nome ?? "um aluno"}`} ·{" "}
              {trilha.alunos} {trilha.alunos === 1 ? "aluno" : "alunos"}
            </span>
          </div>
          {trilha.descricao && <p className="text-[13px] leading-relaxed text-gray">{trilha.descricao}</p>}

          <div>
            <h3 className="mb-2 font-display text-[13px] font-semibold text-charcoal">Conteúdo</h3>
            {carregando && <p className="text-[12px] text-gray">Carregando módulos...</p>}
            {erro && <p className="text-[12px] text-error-ink">Não foi possível carregar os módulos.</p>}
            {detalhe && detalhe.conteudo.length === 0 && (
              <p className="text-[12px] text-gray">Os módulos ainda estão sendo gerados.</p>
            )}
            {detalhe && (
              <ol className="grid gap-3">
                {detalhe.conteudo.map((tema) => (
                  <li key={tema.id}>
                    <p className="text-[12.5px] font-semibold text-charcoal">{tema.titulo}</p>
                    <ul className="mt-1 grid gap-1 border-l-2 border-line pl-3">
                      {tema.modulos.map((modulo) => (
                        <li key={modulo.id} className="text-[12px] text-gray">
                          {modulo.titulo}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            {!trilha.verificada ? (
              <div className="flex items-center gap-1" role="group" aria-label="Votar na trilha">
                <button
                  type="button"
                  aria-label="Gostei"
                  aria-pressed={trilha.meu_voto === 1}
                  disabled={ocupada}
                  onClick={() => onVotar(trilha, 1)}
                  className={`flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors disabled:opacity-50 ${
                    trilha.meu_voto === 1 ? "border-orange bg-orange/15 text-orange" : "border-line text-gray hover:border-orange/40"
                  }`}
                >
                  <ThumbsUp size={14} />
                </button>
                <span className="min-w-6 text-center text-[12px] font-semibold text-charcoal">{trilha.votos}</span>
                <button
                  type="button"
                  aria-label="Não gostei"
                  aria-pressed={trilha.meu_voto === -1}
                  disabled={ocupada}
                  onClick={() => onVotar(trilha, -1)}
                  className={`flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors disabled:opacity-50 ${
                    trilha.meu_voto === -1 ? "border-orange bg-orange/15 text-orange" : "border-line text-gray hover:border-orange/40"
                  }`}
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            ) : (
              <span />
            )}

            <div className="flex flex-wrap items-center justify-end gap-2">
              {trilha.estudando && !trilha.verificada && !trilha.propria && (
                <button
                  type="button"
                  disabled={ocupada}
                  onClick={() => onPararDeEstudar(trilha)}
                  className={`${ghostButtonClassName} !w-auto px-4 !text-[12px]`}
                >
                  Parar de estudar
                </button>
              )}
              {trilha.verificada || trilha.propria || trilha.estudando ? (
                <button
                  type="button"
                  onClick={() => onConversar(trilha)}
                  className={`${primaryButtonClassName} inline-flex !w-auto items-center gap-1.5 px-4 !text-[12px]`}
                >
                  <MessageCircle size={13} aria-hidden="true" />
                  Conversar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={ocupada}
                  onClick={() => onEstudar(trilha)}
                  className={`${primaryButtonClassName} !w-auto px-4 !text-[12px]`}
                >
                  Adicionar aos estudos
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
