"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { MateriaCard } from "@/components/materias_components/materia_card";
import { CriarMateriaDialog } from "@/components/materias_components/criar_materia_dialog";
import { useMaterias } from "@/hooks/use_materias";

export default function ApostilasPage() {
  const router = useRouter();
  const { materias, carregando, erro, recarregar } = useMaterias();
  const [criando, setCriando] = useState(false);

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Apostilas" subtitle="Conteúdo teórico gerado por IA, no seu ritmo" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-charcoal">Suas apostilas</h2>
          </div>

          {carregando && <p className="text-[13px] text-gray">Carregando apostilas...</p>}

          {!carregando && erro && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <p className="text-[13px] text-gray">Não foi possível carregar suas apostilas.</p>
              <button
                type="button"
                onClick={() => void recarregar()}
                className="mt-3 rounded-[9px] border border-orange px-4 py-2 text-[12px] font-semibold text-orange transition hover:bg-orange/10"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregando && !erro && materias.length === 0 && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <h3 className="font-display text-sm font-semibold text-charcoal">Nenhuma apostila ainda</h3>
              <p className="mt-1 text-[13px] text-gray">
                Crie sua primeira apostila e deixe a IA montar o conteúdo teórico pra você.
              </p>
            </div>
          )}

          {!carregando && !erro && materias.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {materias.map((materia) => (
                <MateriaCard
                  key={materia.id}
                  materia={materia}
                  onAbrir={() => router.push(`/apostilas/${materia.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CriarMateriaDialog
        open={criando}
        onClose={() => setCriando(false)}
        onCriada={(materiaId) => {
          setCriando(false);
          router.push(`/apostilas/${materiaId}`);
        }}
      />
    </main>
  );
}