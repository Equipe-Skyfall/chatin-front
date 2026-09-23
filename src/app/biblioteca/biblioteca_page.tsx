"use client";

import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { ResumoList } from "@/components/biblioteca_components/resumo_list";
import { ResumoViewer } from "@/components/biblioteca_components/resumo_viewer";
import { useResumos } from "@/hooks/use_resumos";

export default function BibliotecaPage() {
  const {
    resumos,
    carregando,
    carregandoMais,
    temMais,
    resumoAberto,
    carregarMais,
    abrir,
    fechar,
  } = useResumos();

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Biblioteca" subtitle="Seus resumos de estudo" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          {carregando && <p className="text-[13px] text-gray">Carregando resumos...</p>}

          {!carregando && resumos.length === 0 && (
            <div className="rounded-[12px] border border-line bg-white p-6 shadow-neo-raised-sm">
              <h2 className="font-display text-sm font-semibold text-charcoal">
                Nenhum resumo ainda
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-gray">
                Abra uma conversa vinculada a um módulo e toque em &quot;Gerar resumo de
                estudo&quot; para montar sua biblioteca.
              </p>
            </div>
          )}

          {!carregando && resumos.length > 0 && (
            <>
              <ResumoList resumos={resumos} onAbrir={abrir} />
              {temMais && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={carregarMais}
                    disabled={carregandoMais}
                    className="rounded-[9px] border border-orange px-4 py-2 text-[12px] font-semibold text-orange transition-colors hover:bg-orange/10 disabled:opacity-60"
                  >
                    {carregandoMais ? "Carregando..." : "Carregar mais"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {resumoAberto && <ResumoViewer resumo={resumoAberto} onFechar={fechar} />}
    </main>
  );
}
