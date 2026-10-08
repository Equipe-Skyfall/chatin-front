"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { MateriaReader } from "@/components/materias_components/materia_reader";
import { useMateriaLeitura } from "@/hooks/use_materia_leitura";

interface MateriaLeituraPageProps {
  materiaId: string;
}

export default function MateriaLeituraPage({ materiaId }: MateriaLeituraPageProps) {
  const {
    materia,
    temas,
    carregando,
    erro,
    moduloSelecionadoId,
    setModuloSelecionadoId,
    moduloDetalhe,
    carregandoModulo,
  } = useMateriaLeitura(materiaId);

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={materia?.nome ?? "Apostila"} subtitle="Leitura teórica" />
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-5 sm:px-7">
          <Link
            href="/apostilas"
            className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-gray hover:text-orange"
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
              moduloSelecionadoId={moduloSelecionadoId}
              onSelecionarModulo={setModuloSelecionadoId}
              moduloDetalhe={moduloDetalhe}
              carregandoModulo={carregandoModulo}
            />
          )}
        </div>
      </section>
    </main>
  );
}