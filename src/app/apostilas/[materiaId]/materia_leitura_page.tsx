"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { ChatinFlutuante } from "@/components/chat_components/chatin_flutuante";
import { MateriaReader } from "@/components/materias_components/materia_reader";
import { getSubjectColor } from "@/components/progresso_components/subject_icon";
import { useMateriaLeitura } from "@/hooks/use_materia_leitura";
import { useProgressoLeitura } from "@/hooks/use_progresso_leitura";

interface MateriaLeituraPageProps {
  materiaId: string;
  moduloInicialId?: string | null;
}

export default function MateriaLeituraPage({ materiaId, moduloInicialId = null }: MateriaLeituraPageProps) {
  const {
    materia,
    temas,
    estadosModulos,
    estadosTemas,
    carregando,
    erro,
    moduloSelecionadoId,
    selecionarModulo,
    moduloDetalhe,
    carregandoModulo,
    moduloBloqueado,
    erroModulo,
    recarregarModulo,
    modulosLidos,
    marcarModuloLido,
    desmarcarModuloLido,
  } = useMateriaLeitura(materiaId, moduloInicialId);

  const progressoLeitura = useProgressoLeitura(moduloSelecionadoId);
  const cor = materia ? getSubjectColor(materia.id) : "#fb7118";

  return (
    <main className="flex min-h-screen bg-surface">
      <div
        className="fixed inset-x-0 top-0 z-40 h-[3px]"
        role="progressbar"
        aria-label="Progresso de leitura"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressoLeitura)}
      >
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${progressoLeitura}%`, backgroundColor: cor }}
        />
      </div>

      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={materia?.nome ?? "Apostila"} subtitle="Leitura teórica" />
        <div className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-5 sm:px-7 lg:py-8">
          <Link
            href="/apostilas"
            className="mb-5 flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-gray hover:text-orange"
          >
            <ArrowLeft size={14} /> Voltar para apostilas
          </Link>

          {carregando && <p className="text-[13px] text-gray">Carregando apostila...</p>}

          {!carregando && erro && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <p className="text-[13px] text-gray">Não foi possível carregar essa apostila.</p>
            </div>
          )}

          {!carregando && !erro && materia && (
            <MateriaReader
              materia={materia}
              temas={temas}
              estadosModulos={estadosModulos}
              estadosTemas={estadosTemas}
              moduloSelecionadoId={moduloSelecionadoId}
              onSelecionarModulo={selecionarModulo}
              moduloDetalhe={moduloDetalhe}
              carregandoModulo={carregandoModulo}
              moduloBloqueado={moduloBloqueado}
              erroModulo={erroModulo}
              onTentarNovamente={recarregarModulo}
              modulosLidos={modulosLidos}
              onMarcarLido={marcarModuloLido}
              onDesmarcarLido={desmarcarModuloLido}
            />
          )}
        </div>
      </section>

      <ChatinFlutuante
        key={moduloSelecionadoId ?? "sem-modulo"}
        moduloId={moduloSelecionadoId}
        titulo={moduloDetalhe?.titulo ?? null}
      />
    </main>
  );
}