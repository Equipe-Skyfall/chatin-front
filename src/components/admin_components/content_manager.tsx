"use client";

import { useContentManager } from "@/hooks/use_content_manager";
import { MateriaSection } from "./materia_section";
import { TemaSection } from "./tema_section";
import { ModuloSection } from "./modulo_section";

export function ContentManager() {
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
    adicionarMateria,
    editarMateria,
    excluirMateria,
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

  const ocupado = executando !== null;

  return (
    <div className="mx-auto grid h-full w-full auto-rows-min gap-4 overflow-y-auto px-4 py-5 sm:px-7 lg:auto-rows-fr lg:grid-cols-3 lg:overflow-hidden">
      <MateriaSection
        materias={materias}
        materiaAtual={materiaAtual}
        carregando={carregandoMaterias}
        ocupado={ocupado}
        onSelecionar={selecionarMateria}
        onCriar={adicionarMateria}
        onAtualizar={editarMateria}
        onExcluir={excluirMateria}
      />
      <TemaSection
        temas={temas}
        temaAtual={temaAtual}
        materiaSelecionada={materiaAtual?.id ?? null}
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
  );
}
