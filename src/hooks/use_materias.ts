"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { listarMaterias, type Materia } from "@/lib/materias";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

export function useMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      const data = await listarMaterias();
      setMaterias(data);
    } catch (error) {
      setErro(true);
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar, padrão já usado no restante do app
    carregar();
  }, [carregar]);

  return { materias, carregando, erro, recarregar: carregar };
}