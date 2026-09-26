"use client";

import { useEffect, useRef, useState } from "react";
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

const INTERVALO_ACOMPANHAMENTO_MS = 4000;
const MAX_ACOMPANHAMENTOS = 45;

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
  const acompanhamentosRef = useRef(0);
  const assinaturaRef = useRef("");

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

  const moduloEmGeracao = modulos.some((modulo) => modulo.status.toLowerCase() === "gerando");

  useEffect(() => {
    const deveAcompanhar = executando === "gerar-modulos" || moduloEmGeracao;

    if (!temaId || !deveAcompanhar) {
      acompanhamentosRef.current = 0;
      return;
    }

    const temaAcompanhado = temaId;
    let ativo = true;

    const intervalo = setInterval(() => {
      acompanhamentosRef.current += 1;

      if (acompanhamentosRef.current > MAX_ACOMPANHAMENTOS) {
        clearInterval(intervalo);
        return;
      }

      listarModulos(temaAcompanhado, { skipCache: true })
        .then((lista) => {
          if (!ativo) return;

          const assinatura = lista.map((modulo) => modulo.status).join("|");
          if (assinatura !== assinaturaRef.current) {
            assinaturaRef.current = assinatura;
            acompanhamentosRef.current = 0;
          }

          setModulos(lista);
          setModulosCarregadosPara(temaAcompanhado);
        })
        .catch(() => undefined);
    }, INTERVALO_ACOMPANHAMENTO_MS);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [temaId, executando, moduloEmGeracao]);

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

  async function recarregarTemas(materiaSelecionada: string) {
    try {
      const lista = await listarTemas(materiaSelecionada);
      setTemas(lista);
      setTemasCarregadosPara(materiaSelecionada);
    } catch (error) {
      tratarErro(error);
    }
  }

  async function recarregarModulos(temaSelecionado: string) {
    try {
      const lista = await listarModulos(temaSelecionado);
      setModulos(lista);
      setModulosCarregadosPara(temaSelecionado);
    } catch (error) {
      tratarErro(error);
    }
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
        setTemaId(tema.id);
        setModuloId(null);
        await recarregarTemas(materiaId);
      },
      "Tema criado."
    );
  }

  function editarTema(id: string, input: TemaUpdateInput) {
    return executar(
      "tema",
      async () => {
        if (!materiaId) return;
        await atualizarTema(materiaId, id, input);
        await recarregarTemas(materiaId);
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
        if (temaId === id) limparTemaSelecionado();
        await recarregarTemas(materiaId);
      },
      "Tema excluído."
    );
  }

  function regenerarTemaComIa(id: string) {
    return executar(
      `regen-tema-${id}`,
      async () => {
        if (!materiaId) return;
        await regenerarTema(materiaId, id);
        await recarregarTemas(materiaId);
      },
      "Tema regenerado com IA."
    );
  }

  function adicionarModulo(input: ModuloInput) {
    return executar(
      "modulo",
      async () => {
        if (!temaId) return;
        await criarModulo(temaId, input);
        await recarregarModulos(temaId);
      },
      "Módulo criado."
    );
  }

  function gerarModulosComIa() {
    return executar(
      "gerar-modulos",
      async () => {
        if (!temaId) return;
        await gerarModulosAutomaticamente(temaId);
        await recarregarModulos(temaId);
      },
      "Módulos gerados com IA."
    );
  }

  function editarModulo(id: string, input: ModuloUpdateInput) {
    return executar(
      "modulo",
      async () => {
        if (!temaId) return;
        await atualizarModulo(temaId, id, input);
        await recarregarModulos(temaId);
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
        await recarregarModulos(temaId);
      },
      "Módulo excluído."
    );
  }

  function regenerarModuloComIa(id: string, instrucoes?: string | null) {
    return executar(
      `regen-modulo-${id}`,
      async () => {
        if (!temaId) return;
        await regenerarModulo(temaId, id, instrucoes);
        await recarregarModulos(temaId);
      },
      "Módulo regenerado com IA."
    );
  }

  function regenerarQuestionarioComIa(id: string) {
    return executar(
      `regen-questionario-${id}`,
      async () => {
        if (!temaId) return;
        await regenerarQuestionarioModulo(temaId, id);
        await recarregarModulos(temaId);
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
