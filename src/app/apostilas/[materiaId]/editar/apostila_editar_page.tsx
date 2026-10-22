"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { TemaSection } from "@/components/admin_components/tema_section";
import { ModuloSection } from "@/components/admin_components/modulo_section";
import { useContentManager } from "@/hooks/use_content_manager";
import { useSession } from "@/hooks/use_session";
import { obterMateria } from "@/lib/materias";

interface ApostilaEditarPageProps {
  materiaId: string;
}

/**
 * Edição do conteúdo (tópicos/módulos) de uma apostila do próprio aluno.
 * Reaproveita o mesmo editor do admin (`useContentManager` + TemaSection/ModuloSection),
 * escopado a uma matéria. Apostila é pública, mas só o dono edita - quem não é
 * dono é redirecionado de volta para a leitura.
 */
export default function ApostilaEditarPage({ materiaId }: ApostilaEditarPageProps) {
  const router = useRouter();
  const { user, carregando: carregandoSessao } = useSession();
  const {
    materias,
    materiaAtual,
    temas,
    temaAtual,
    modulos,
    moduloAtual,
    carregandoMaterias,
    carregandoTemas,
    carregandoModulos,
    executando,
    selecionarMateria,
    selecionarTema,
    selecionarModulo,
    adicionarTema,
    editarTema,
    excluirTema,
    regenerarTemaComIa,
    adicionarModulo,
    gerarModulosComIa,
    editarModulo,
    excluirModulo,
    regenerarModuloComIa,
    regenerarQuestionarioComIa,
  } = useContentManager();

  const [autorizado, setAutorizado] = useState(false);
  const verificadoRef = useRef(false);

  // Seleciona a matéria no editor assim que a lista carrega.
  useEffect(() => {
    if (carregandoMaterias) return;
    if (materias.some((materia) => materia.id === materiaId)) selecionarMateria(materiaId);
  }, [carregandoMaterias, materias, materiaId, selecionarMateria]);

  // Guarda de dono.
  useEffect(() => {
    if (carregandoSessao || !user || verificadoRef.current) return;
    verificadoRef.current = true;

    let ativo = true;
    obterMateria(materiaId)
      .then((materia) => {
        if (!ativo) return;
        if (materia.owner_user_id != null && materia.owner_user_id === user.id) setAutorizado(true);
        else router.replace(`/apostilas/${materiaId}`);
      })
      .catch(() => {
        if (ativo) router.replace("/apostilas");
      });

    return () => {
      ativo = false;
    };
  }, [carregandoSessao, user, materiaId, router]);

  const ocupado = executando !== null;

  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={materiaAtual?.nome ?? "Editar apostila"} subtitle="Tópicos e módulos" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <Link
            href={`/apostilas/${materiaId}`}
            className="mb-4 flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-gray hover:text-orange"
          >
            <ArrowLeft size={14} /> Voltar para a apostila
          </Link>

          {!autorizado ? (
            <p className="text-[13px] text-gray">Verificando permissão...</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
              <TemaSection
                temas={temas}
                temaAtual={temaAtual}
                materiaSelecionada={materiaId}
                carregando={carregandoTemas}
                ocupado={ocupado}
                onSelecionar={selecionarTema}
                onCriar={adicionarTema}
                onAtualizar={editarTema}
                onExcluir={excluirTema}
                onRegenerar={regenerarTemaComIa}
              />
              <ModuloSection
                modulos={modulos}
                moduloAtual={moduloAtual}
                temaSelecionado={temaAtual?.id ?? null}
                carregando={carregandoModulos}
                gerando={executando === "gerar-modulos"}
                ocupado={ocupado}
                onSelecionar={selecionarModulo}
                onCriar={adicionarModulo}
                onGerar={gerarModulosComIa}
                onAtualizar={editarModulo}
                onExcluir={excluirModulo}
                onRegenerar={regenerarModuloComIa}
                onRegenerarQuestionario={regenerarQuestionarioComIa}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
