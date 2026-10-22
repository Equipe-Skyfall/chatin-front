"use client";

import { useState } from "react";
import { criarMateria, criarTema } from "@/lib/materias";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import { iniciarGeracaoApostila } from "@/hooks/use_geracao_apostila";

export type EtapaCriacao = "formulario" | "criando" | "erro";

/**
 * Cria a matéria e o primeiro tema e dispara a geração dos módulos em segundo
 * plano (ver `use_geracao_apostila`). Não espera a IA: assim que o tema existe,
 * o dialog fecha e o aluno pode seguir navegando.
 */
export function useCriarMateria(onCriada: (materiaId: string) => void) {
  const [etapa, setEtapa] = useState<EtapaCriacao>("formulario");
  const [erro, setErro] = useState<string | null>(null);

  async function criar(dados: { nome: string; descricao: string; titulo: string; direcionamento: string }) {
    setEtapa("criando");
    setErro(null);

    try {
      const materia = await criarMateria({ nome: dados.nome, descricao: dados.descricao });
      const tema = await criarTema(materia.id, {
        titulo: dados.titulo,
        descricao: dados.descricao,
        direcionamento: dados.direcionamento,
      });

      iniciarGeracaoApostila({ materiaId: materia.id, materiaNome: materia.nome, temaId: tema.id });
      setEtapa("formulario");
      onCriada(materia.id);
    } catch (error) {
      setEtapa("erro");
      setErro(getFriendlyErrorMessage(error));
    }
  }

  function reiniciar() {
    setEtapa("formulario");
    setErro(null);
  }

  return { etapa, erro, criar, reiniciar };
}
