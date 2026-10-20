"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { MateriaCard } from "@/components/materias_components/materia_card";
import { CriarMateriaDialog } from "@/components/materias_components/criar_materia_dialog";
import { EditarMateriaDialog } from "@/components/materias_components/editar_materia_dialog";
import { ConfirmDialog } from "@/components/profile_components/confirm_dialog";
import { useMaterias } from "@/hooks/use_materias";
import { useGeracaoApostila } from "@/hooks/use_geracao_apostila";
import { useSession } from "@/hooks/use_session";
import { deletarMateria } from "@/lib/content";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import type { Materia } from "@/lib/materias";

export default function ApostilasPage() {
  const router = useRouter();
  const { user } = useSession();
  const { materias, carregando, erro, recarregar } = useMaterias();
  const { geracoes } = useGeracaoApostila();
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [excluindo, setExcluindo] = useState<Materia | null>(null);
  const [excluindoAgora, setExcluindoAgora] = useState(false);

  // Apostila é pública: todos veem, mas só o dono edita/exclui.
  function ehMinha(materia: Materia) {
    return materia.owner_user_id != null && materia.owner_user_id === user?.id;
  }

  async function confirmarExclusao() {
    if (!excluindo) return;

    setExcluindoAgora(true);
    try {
      await deletarMateria(excluindo.id);
      toast.success("Apostila excluída.");
      setExcluindo(null);
      void recarregar();
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setExcluindoAgora(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Apostilas" subtitle="Conteúdo teórico gerado por IA, no seu ritmo" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-charcoal">Apostilas</h2>
            <button
              type="button"
              onClick={() => setCriando(true)}
              className="flex items-center gap-1.5 rounded-[9px] bg-orange-light px-3.5 py-2 text-[12.5px] font-bold text-white shadow-neo-raised-sm transition hover:brightness-95"
            >
              <Plus size={15} /> Nova apostila
            </button>
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
                  podeGerenciar={ehMinha(materia)}
                  onEditar={() => setEditando(materia)}
                  onGerenciarConteudo={() => router.push(`/apostilas/${materia.id}/editar`)}
                  onExcluir={() => setExcluindo(materia)}
                  gerando={geracoes.some((geracao) => geracao.materiaId === materia.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CriarMateriaDialog
        open={criando}
        onClose={() => setCriando(false)}
        onCriada={() => {
          setCriando(false);
          void recarregar();
        }}
      />

      <EditarMateriaDialog
        key={editando?.id ?? "sem-edicao"}
        materia={editando}
        onClose={() => setEditando(null)}
        onSalva={() => void recarregar()}
      />

      <ConfirmDialog
        open={excluindo !== null}
        title="Excluir apostila"
        description={
          excluindo
            ? `Tem certeza que deseja excluir "${excluindo.nome}"? Essa ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        loadingLabel="Excluindo..."
        loading={excluindoAgora}
        onConfirm={() => void confirmarExclusao()}
        onCancel={() => setExcluindo(null)}
      />
    </main>
  );
}
