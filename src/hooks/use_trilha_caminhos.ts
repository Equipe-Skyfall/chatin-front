"use client";

import { useEffect, useState } from "react";
import { obterTrilha } from "@/lib/chat";
import type { TrilhaMateria } from "@/interfaces/chat_interfaces";

/** Trilha com temas e módulos (para o caminho). É um complemento da tela: se
 * falhar, o resto do Início segue funcionando sem o caminho. */
export function useTrilhaCaminhos() {
  const [materias, setMaterias] = useState<TrilhaMateria[]>([]);

  useEffect(() => {
    let ativo = true;
    obterTrilha()
      .then((trilha) => {
        if (ativo) setMaterias(trilha.materias);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);

  return { materias };
}
