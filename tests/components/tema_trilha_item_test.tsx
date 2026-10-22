// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemaTrilhaItem } from "@/components/materias_components/tema_trilha_item";
import type { TemaComModulos } from "@/hooks/use_materia_leitura";

const tema: TemaComModulos = {
  id: "t1",
  materia_id: "mat1",
  titulo: "Fundamentos",
  descricao: "",
  ordem: 1,
  status: "pronto",
  direcionamento: "",
  created_at: "",
  modulos: [
    { id: "m1", tema_id: "t1", titulo: "Origem", descricao: "", ordem: 1, status: "pronto", created_at: "" },
    { id: "m2", tema_id: "t1", titulo: "Causas", descricao: "", ordem: 2, status: "pronto", created_at: "" },
  ],
};

function montar(modulosLidos: string[] = []) {
  render(
    <TemaTrilhaItem
      tema={tema}
      numero={1}
      estadoTema="disponivel"
      estadosModulos={{ m1: "disponivel", m2: "disponivel" }}
      moduloSelecionadoId={null}
      onSelecionarModulo={vi.fn()}
      cor="#fb7118"
      ultimo
      modulosLidos={modulosLidos}
    />
  );
}

describe("TemaTrilhaItem - indicador de leitura", () => {
  it("marca como 'Lido' apenas os módulos já lidos", () => {
    montar(["m1"]);

    expect(screen.getAllByLabelText("Lido")).toHaveLength(1);
  });

  it("não mostra o indicador quando nada foi lido", () => {
    montar();

    expect(screen.queryByLabelText("Lido")).toBeNull();
  });
});
