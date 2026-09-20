"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  atualizarMateria,
  atualizarModulo,
  atualizarTema,
  criarMateria,
  criarModulo,
  criarTema,
  deletarMateria,
  deletarModulo,
  deletarTema,
  gerarModulosAutomaticamente,
  listarMaterias,
  listarModulos,
  listarTemas,
  regenerarModulo,
  regenerarQuestionarioModulo,
  regenerarTema,
} from "@/lib/content";
import { useStudyErrorHandler } from "@/hooks/use_study_error";
import type {
  Materia,
  MateriaInput,
  Modulo,
  ModuloInput,
  ModuloUpdateInput,
  Tema,
  TemaInput,
  TemaUpdateInput,
} from "@/interfaces/content_interfaces";

export function useContentManager() {
  const tratarErro = useStudyErrorHandler();

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaId, setMateriaId] = useState<string | null>(null);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [temaId, setTemaId] = useState<string | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloId, setModuloId] = useState<string | null>(null);
  const [carregandoMaterias, setCarregandoMaterias] = useState(true);
  const [temasCarregadosPara, setTemasCarregadosPara] = useState<string | null>(null);
  const [modulosCarregadosPara, setModulosCarregadosPara] = useState<string | null>(null);
  const [executando, setExecutando] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    listarMaterias()
      .then((lista) => {
        if (ativo) setMaterias(lista);
      })
      .catch((error) => {
        if (ativo) tratarErro(error);
      })
      .finally(() => {
        if (ativo) setCarregandoMaterias(false);
      });

    return () => {
      ativo = false;
    };
  }, [tratarErro]);

  useEffect(() => {
    if (!materiaId) return;

    let ativo = true;

    listarTemas(materiaId)
      .then((lista) => {
        if (!ativo) return;
        setTemas(lista);
        setTemasCarregadosPara(materiaId);
      })
      .catch((error) => {
        if (!ativo) return;
        setTemas([]);
        setTemasCarregadosPara(materiaId);
        tratarErro(error);
      });

    return () => {
      ativo = false;
    };
  }, [materiaId, tratarErro]);

  useEffect(() => {
    if (!temaId) return;

    let ativo = true;

    listarModulos(temaId)
      .then((lista) => {
        if (!ativo) return;
        setModulos(lista);
        setModulosCarregadosPara(temaId);
      })
      .catch((error) => {
        if (!ativo) return;
        setModulos([]);
        setModulosCarregadosPara(temaId);
        tratarErro(error);
      });

    return () => {
      ativo = false;
    };
  }, [temaId, tratarErro]);

  const temasVisiveis = materiaId && temasCarregadosPara === materiaId ? temas : [];
  const modulosVisiveis = temaId && modulosCarregadosPara === temaId ? modulos : [];

  const carregandoTemas = materiaId !== null && temasCarregadosPara !== materiaId;
  const carregandoModulos = temaId !== null && modulosCarregadosPara !== temaId;

  async function executar(chave: string, acao: () => Promise<void>, sucesso: string) {
    setExecutando(chave);
    try {
      await acao();
      toast.success(sucesso);
    } catch (error) {
      tratarErro(error);
    } finally {
      setExecutando(null);
    }
  }

  const materiaAtual = materias.find((materia) => materia.id === materiaId) ?? null;
  const temaAtual = temasVisiveis.find((tema) => tema.id === temaId) ?? null;
  const moduloAtual = modulosVisiveis.find((modulo) => modulo.id === moduloId) ?? null;

  function limparTemaSelecionado() {
    setTemaId(null);
    setModuloId(null);
  }

  function limparMateriaSelecionada() {
    setMateriaId(null);
    limparTemaSelecionado();
  }

  function selecionarMateria(id: string) {
    if (id === materiaId) return;

    setMateriaId(id);
    limparTemaSelecionado();
  }

  function selecionarTema(id: string) {
    if (id === temaId) return;

    setTemaId(id);
    setModuloId(null);
  }

  function selecionarModulo(id: string) {
    setModuloId(id);
  }

  function adicionarMateria(input: MateriaInput) {
    return executar(
      "materia",
      async () => {
        const materia = await criarMateria(input);
        setMaterias((atuais) => [...atuais, materia]);
        setMateriaId(materia.id);
        limparTemaSelecionado();
      },
      "Matéria criada."
    );
  }

  function editarMateria(id: string, input: MateriaInput) {
    return executar(
      "materia",
      async () => {
        const materia = await atualizarMateria(id, input);
        setMaterias((atuais) => atuais.map((item) => (item.id === materia.id ? materia : item)));
      },
      "Matéria atualizada."
    );
  }

  function excluirMateria(id: string) {
    return executar(
      "materia",
      async () => {
        await deletarMateria(id);
        setMaterias((atuais) => atuais.filter((item) => item.id !== id));
        if (materiaId === id) limparMateriaSelecionada();
      },
      "Matéria excluída."
    );
  }

  function adicionarTema(input: TemaInput) {
    return executar(
      "tema",
      async () => {
        if (!materiaId) return;
        const tema = await criarTema(materiaId, input);
        setTemas((atuais) => [...atuais, tema]);
        setTemaId(tema.id);
        setModuloId(null);
      },
      "Tema criado."
    );
  }

  function editarTema(id: string, input: TemaUpdateInput) {
    return executar(
      "tema",
      async () => {
        if (!materiaId) return;
        const tema = await atualizarTema(materiaId, id, input);
        setTemas((atuais) => atuais.map((item) => (item.id === tema.id ? tema : item)));
      },
      "Tema atualizado."
    );
  }

  function excluirTema(id: string) {
    return executar(
      "tema",
      async () => {
        if (!materiaId) return;
        await deletarTema(materiaId, id);
        setTemas((atuais) => atuais.filter((item) => item.id !== id));
        if (temaId === id) limparTemaSelecionado();
      },
      "Tema excluído."
    );
  }

  function regenerarTemaComIa(id: string) {
    return executar(
      `regen-tema-${id}`,
      async () => {
        if (!materiaId) return;
        const tema = await regenerarTema(materiaId, id);
        setTemas((atuais) => atuais.map((item) => (item.id === tema.id ? tema : item)));
      },
      "Tema regenerado com IA."
    );
  }

  function adicionarModulo(input: ModuloInput) {
    return executar(
      "modulo",
      async () => {
        if (!temaId) return;
        const modulo = await criarModulo(temaId, input);
        setModulos((atuais) => [...atuais, modulo]);
      },
      "Módulo criado."
    );
  }

  function gerarModulosComIa() {
    return executar(
      "gerar-modulos",
      async () => {
        if (!temaId) return;
        setModulos(await gerarModulosAutomaticamente(temaId));
      },
      "Módulos gerados com IA."
    );
  }

  function editarModulo(id: string, input: ModuloUpdateInput) {
    return executar(
      "modulo",
      async () => {
        if (!temaId) return;
        const modulo = await atualizarModulo(temaId, id, input);
        setModulos((atuais) => atuais.map((item) => (item.id === modulo.id ? modulo : item)));
      },
      "Módulo atualizado."
    );
  }

  function excluirModulo(id: string) {
    return executar(
      "modulo",
      async () => {
        if (!temaId) return;
        await deletarModulo(temaId, id);
        setModulos((atuais) => atuais.filter((item) => item.id !== id));
      },
      "Módulo excluído."
    );
  }

  function regenerarModuloComIa(id: string, instrucoes?: string | null) {
    return executar(
      `regen-modulo-${id}`,
      async () => {
        if (!temaId) return;
        const modulo = await regenerarModulo(temaId, id, instrucoes);
        setModulos((atuais) => atuais.map((item) => (item.id === modulo.id ? modulo : item)));
      },
      "Módulo regenerado com IA."
    );
  }

  function regenerarQuestionarioComIa(id: string) {
    return executar(
      `regen-questionario-${id}`,
      async () => {
        if (!temaId) return;
        const modulo = await regenerarQuestionarioModulo(temaId, id);
        setModulos((atuais) => atuais.map((item) => (item.id === modulo.id ? modulo : item)));
      },
      "Questionário regenerado com IA."
    );
  }

  return {
    materias,
    materiaAtual,
    temas: temasVisiveis,
    temaAtual,
    modulos: modulosVisiveis,
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
  };
}
