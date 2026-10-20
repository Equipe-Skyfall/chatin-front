import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, Check, ClipboardCheck, Clock, Lock, TriangleAlert } from "lucide-react";
import { getSubjectColor } from "@/components/progresso_components/subject_icon";
import { ApostilaMarkdown } from "./apostilas_markdown";
import { TemaTrilhaItem } from "./tema_trilha_item";
import type { EstadosPorId, TemaComModulos } from "@/hooks/use_materia_leitura";
import type { Materia, ModuloDetalhe } from "@/lib/materias";

const PAPEL = "bg-[#fffdf8] shadow-[0_1px_2px_rgba(34,26,15,0.06),0_10px_30px_rgba(34,26,15,0.10)]";

interface MateriaReaderProps {
  materia: Materia;
  temas: TemaComModulos[];
  estadosModulos: EstadosPorId;
  estadosTemas: EstadosPorId;
  moduloSelecionadoId: string | null;
  onSelecionarModulo: (moduloId: string) => void;
  moduloDetalhe: ModuloDetalhe | null;
  carregandoModulo: boolean;
  moduloBloqueado: boolean;
  /** Módulos cuja leitura o aluno já concluiu (progresso local). */
  modulosLidos?: string[];
  /** Marca a leitura do módulo atual como concluída. */
  onMarcarLido?: (moduloId: string) => void;
  /** Desfaz a conclusão de leitura do módulo atual. */
  onDesmarcarLido?: (moduloId: string) => void;
  /** Falhou ao buscar o conteúdo do módulo atual (ex.: erro do backend). */
  erroModulo?: boolean;
  /** Nova tentativa de buscar o conteúdo do módulo atual. */
  onTentarNovamente?: () => void;
}

function minutosDeLeitura(texto: string): number {
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

export function MateriaReader({
  materia,
  temas,
  estadosModulos,
  estadosTemas,
  moduloSelecionadoId,
  onSelecionarModulo,
  moduloDetalhe,
  carregandoModulo,
  moduloBloqueado,
  modulosLidos = [],
  onMarcarLido,
  onDesmarcarLido,
  erroModulo = false,
  onTentarNovamente,
}: MateriaReaderProps) {
  const cor = getSubjectColor(materia.id);

  const totalModulos = temas.reduce((soma, tema) => soma + tema.modulos.length, 0);
  const modulosConcluidos = temas.reduce(
    (soma, tema) => soma + tema.modulos.filter((modulo) => estadosModulos[modulo.id] === "concluido").length,
    0
  );
  const percentualConcluido = totalModulos === 0 ? 0 : Math.round((modulosConcluidos / totalModulos) * 100);

  const idsModulos = temas.flatMap((tema) => tema.modulos.map((modulo) => modulo.id));
  const totalLidos = modulosLidos.filter((id) => idsModulos.includes(id)).length;
  const moduloAtualLido = moduloSelecionadoId !== null && modulosLidos.includes(moduloSelecionadoId);

  // Ordem de leitura: só os capítulos liberados entram na navegação anterior/próximo.
  const sequencia = useMemo(
    () => temas.filter((tema) => estadosTemas[tema.id] !== "bloqueado").flatMap((tema) => tema.modulos),
    [temas, estadosTemas]
  );
  const indice = sequencia.findIndex((modulo) => modulo.id === moduloSelecionadoId);
  const anterior = indice > 0 ? sequencia[indice - 1] : null;
  const proximo = indice >= 0 && indice < sequencia.length - 1 ? sequencia[indice + 1] : null;

  const indiceTemaAtual = temas.findIndex((tema) => tema.modulos.some((modulo) => modulo.id === moduloSelecionadoId));
  const temaAtual = indiceTemaAtual >= 0 ? temas[indiceTemaAtual] : null;
  const posicaoNoTema = temaAtual ? temaAtual.modulos.findIndex((modulo) => modulo.id === moduloSelecionadoId) : -1;

  const estadoSelecionado = moduloSelecionadoId ? estadosModulos[moduloSelecionadoId] : undefined;

  const sumario = (
    <>
      <div className="mb-6">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray">Sumário</p>
        <h2 className="mt-1 font-display text-[17px] font-semibold leading-snug text-charcoal">{materia.nome}</h2>
        <div
          className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label="Módulos concluídos"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentualConcluido}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentualConcluido}%`, backgroundColor: cor }}
          />
        </div>
        <p className="mt-1.5 text-[11.5px] text-gray">
          {modulosConcluidos} de {totalModulos} {totalModulos === 1 ? "módulo concluído" : "módulos concluídos"}
        </p>
        {totalModulos > 0 && (
          <p className="mt-0.5 text-[11.5px] text-orange">
            {totalLidos} de {totalModulos} {totalModulos === 1 ? "módulo lido" : "módulos lidos"}
          </p>
        )}
      </div>

      <nav aria-label="Capítulos e módulos">
        {temas.map((tema, posicao) => (
          <TemaTrilhaItem
            key={tema.id}
            tema={tema}
            numero={posicao + 1}
            estadoTema={estadosTemas[tema.id]}
            estadosModulos={estadosModulos}
            moduloSelecionadoId={moduloSelecionadoId}
            onSelecionarModulo={onSelecionarModulo}
            cor={cor}
            ultimo={posicao === temas.length - 1}
            modulosLidos={modulosLidos}
          />
        ))}
      </nav>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-dashed border-line pt-3 text-[11px] text-gray">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-orange" /> Quiz liberado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border border-gray" /> Quiz bloqueado
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={12} className="text-green-600" /> Concluído
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpenCheck size={12} className="text-orange" /> Lido
        </span>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
      <details className={`rounded-[6px] p-4 lg:hidden ${PAPEL}`}>
        <summary className="cursor-pointer text-[13px] font-medium text-charcoal">
          Sumário · {modulosConcluidos}/{totalModulos} módulos
        </summary>
        <div className="mt-5">{sumario}</div>
      </details>

      <aside className={`hidden w-80 shrink-0 rounded-[6px] p-5 lg:block ${PAPEL}`}>{sumario}</aside>

      <div className="min-w-0 flex-1">
        <article className={`relative mx-auto max-w-[860px] overflow-hidden rounded-[6px] ${PAPEL}`}>
          <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: cor }} aria-hidden="true" />

          <div className="px-6 py-10 sm:px-14 sm:py-14 lg:px-20">
            {moduloBloqueado && (
              <div className="mx-auto flex max-w-[420px] flex-col items-center gap-3 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface">
                  <Lock size={22} className="text-gray" />
                </div>
                <h2 className="font-display text-[16px] font-semibold text-charcoal">Conteúdo bloqueado</h2>
                <p className="text-[13px] leading-relaxed text-gray">
                  Este conteúdo é liberado conforme você avança. Seja aprovado nos quizzes anteriores para
                  desbloqueá-lo.
                </p>
                <Link
                  href="/quiz"
                  className="mt-1 rounded-[9px] border border-orange px-4 py-2 text-[12.5px] font-semibold text-orange transition hover:bg-orange/10"
                >
                  Ir para os questionários
                </Link>
              </div>
            )}

            {!moduloBloqueado && carregandoModulo && <p className="py-12 text-[13px] text-gray">Carregando conteúdo...</p>}

            {!moduloBloqueado && !carregandoModulo && erroModulo && (
              <div className="mx-auto flex max-w-[420px] flex-col items-center gap-3 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface">
                  <TriangleAlert size={22} className="text-[#a83f2e]" />
                </div>
                <h2 className="font-display text-[16px] font-semibold text-charcoal">
                  Não foi possível carregar este conteúdo
                </h2>
                <p className="text-[13px] leading-relaxed text-gray">
                  Tivemos um problema ao buscar o texto deste módulo. Tente novamente ou escolha outro módulo no
                  sumário.
                </p>
                {onTentarNovamente && (
                  <button
                    type="button"
                    onClick={onTentarNovamente}
                    className="mt-1 rounded-[9px] border border-orange px-4 py-2 text-[12.5px] font-semibold text-orange transition hover:bg-orange/10"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}

            {!moduloBloqueado && !carregandoModulo && moduloDetalhe && (
              <div className="mx-auto max-w-[680px]">
                <header>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: cor }}>
                    {temaAtual ? `Capítulo ${indiceTemaAtual + 1} · ${temaAtual.titulo}` : materia.nome}
                  </p>
                  <h1 className="mt-3 font-display text-[28px] font-bold leading-tight text-charcoal sm:text-[34px]">
                    {moduloDetalhe.titulo}
                  </h1>
                  {moduloDetalhe.descricao && (
                    <p className="mt-3 font-serif text-[16px] italic leading-relaxed text-gray">
                      {moduloDetalhe.descricao}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray">
                    {temaAtual && posicaoNoTema >= 0 && (
                      <span>
                        Módulo {posicaoNoTema + 1} de {temaAtual.modulos.length}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {minutosDeLeitura(moduloDetalhe.conteudo)} min de leitura
                    </span>
                  </div>
                  <hr className="mt-6 border-line" />
                </header>

                <div className="mt-8">
                  <ApostilaMarkdown content={moduloDetalhe.conteudo} />
                </div>

                <footer>
                  <div className="mt-12 rounded-[8px] border border-dashed border-line bg-surface/60 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                    <div>
                      <p className="font-display text-[14px] font-semibold text-charcoal">Terminou de ler?</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-gray">
                        {estadoSelecionado === "concluido"
                          ? "Você já foi aprovado neste módulo. Pode revisar ou praticar de novo."
                          : estadoSelecionado === "bloqueado"
                            ? "O quiz deste módulo é liberado depois que você for aprovado no quiz do módulo anterior."
                            : "O quiz deste módulo já está liberado."}
                      </p>
                    </div>

                    <div className="mt-4 flex shrink-0 flex-col items-stretch gap-2 sm:mt-0 sm:items-end">
                      {(onMarcarLido || onDesmarcarLido) && (
                        <button
                          type="button"
                          onClick={() => (moduloAtualLido ? onDesmarcarLido : onMarcarLido)?.(moduloDetalhe.id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-[9px] border border-orange px-4 py-2 text-[12.5px] font-semibold text-orange transition hover:bg-orange/10"
                        >
                          <BookOpenCheck size={14} /> {moduloAtualLido ? "Desmarcar como lido" : "Marcar como lido"}
                        </button>
                      )}

                      {estadoSelecionado === "bloqueado" ? (
                        <span className="inline-flex items-center justify-center gap-1.5 rounded-[9px] bg-white px-4 py-2 text-[12.5px] font-semibold text-gray">
                          <Lock size={13} /> Quiz bloqueado
                        </span>
                      ) : (
                        <Link
                          href={`/quiz?highlight=${moduloDetalhe.id}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-[9px] bg-orange-light px-4 py-2 text-[12.5px] font-bold text-white shadow-neo-raised-sm transition hover:brightness-95"
                        >
                          <ClipboardCheck size={14} /> Fazer o quiz
                        </Link>
                      )}
                    </div>
                  </div>

                  <nav aria-label="Navegação entre módulos" className="mt-4 grid grid-cols-2 gap-3">
                    {anterior ? (
                      <button
                        type="button"
                        onClick={() => onSelecionarModulo(anterior.id)}
                        className="flex flex-col items-start rounded-[8px] border border-line px-4 py-3 text-left transition hover:border-orange/40 hover:bg-orange/5"
                      >
                        <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-gray">
                          <ArrowLeft size={12} /> Anterior
                        </span>
                        <span className="mt-1 text-[13px] font-medium leading-snug text-charcoal">
                          {anterior.titulo}
                        </span>
                      </button>
                    ) : (
                      <span />
                    )}

                    {proximo ? (
                      <button
                        type="button"
                        onClick={() => onSelecionarModulo(proximo.id)}
                        className="flex flex-col items-end rounded-[8px] border border-line px-4 py-3 text-right transition hover:border-orange/40 hover:bg-orange/5"
                      >
                        <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-gray">
                          Próximo <ArrowRight size={12} />
                        </span>
                        <span className="mt-1 text-[13px] font-medium leading-snug text-charcoal">
                          {proximo.titulo}
                        </span>
                      </button>
                    ) : (
                      <span />
                    )}
                  </nav>

                  {indice >= 0 && (
                    <p className="mt-10 text-center font-serif text-[12px] text-gray">
                      — {indice + 1} / {sequencia.length} —
                    </p>
                  )}
                </footer>
              </div>
            )}

            {!moduloBloqueado && !carregandoModulo && !erroModulo && !moduloDetalhe && (
              <p className="py-12 text-[13px] text-gray">Selecione um módulo para começar a ler.</p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}