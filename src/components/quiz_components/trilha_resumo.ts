import type { TrilhaMateria } from "@/schemas/quiz";

type EstadoTrilha = TrilhaMateria["temas"][number]["modulos"][number]["estado"];

export interface ResumoTrilhaMateria {
  temas: number;
  totalModulos: number;
  modulosConcluidos: number;
  percentual: number;
  estado: EstadoTrilha;
}

export function resumoTrilhaMateria(materia: TrilhaMateria): ResumoTrilhaMateria {
  const modulos = materia.temas.flatMap((tema) => tema.modulos);
  const totalModulos = modulos.length;
  const modulosConcluidos = modulos.filter((modulo) => modulo.estado === "concluido").length;
  const percentual = totalModulos === 0 ? 0 : Math.round((modulosConcluidos / totalModulos) * 100);

  const estado: EstadoTrilha =
    totalModulos > 0 && modulosConcluidos === totalModulos
      ? "concluido"
      : modulos.some((modulo) => modulo.estado !== "bloqueado")
        ? "disponivel"
        : "bloqueado";

  return { temas: materia.temas.length, totalModulos, modulosConcluidos, percentual, estado };
}
