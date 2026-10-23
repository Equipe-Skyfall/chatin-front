// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RecomendacaoTip } from "@/components/inicio_components/recomendacao_tip";
import type { Recomendacao } from "@/interfaces/recomendacao_interfaces";

const base: Recomendacao = {
  posicao: 1,
  modulo_id: "mod1",
  modulo_titulo: "Causas da Revolução",
  tema_id: "t1",
  tema_titulo: "Revolução Francesa",
  materia_id: "m1",
  materia_nome: "História",
  motivo: "baixo_desempenho",
  justificativa: "Sua taxa de acerto neste tema está baixa.",
  prioridade: 1,
  ultimo_estudo: "2026-10-01T00:00:00Z",
  dias_desde_ultimo_estudo: 12,
  taxa_acerto_tema: 0.4,
};

const segunda: Recomendacao = {
  ...base,
  posicao: 2,
  modulo_id: "mod2",
  modulo_titulo: "Queda da Bastilha",
  materia_id: "m2",
  materia_nome: "Química",
  tema_titulo: "Reações",
  motivo: "revisao_espacada",
  justificativa: "Revisão espaçada vencida.",
  dias_desde_ultimo_estudo: 0,
};

describe("RecomendacaoTip", () => {
  it("lista as sugestões com módulo, matéria/tema, motivo e justificativa", () => {
    render(<RecomendacaoTip recomendacoes={[base, segunda]} onEstudar={vi.fn()} />);

    expect(screen.getByText("Sugestões para você")).toBeInTheDocument();
    expect(screen.getByText("Causas da Revolução")).toBeInTheDocument();
    expect(screen.getByText("Queda da Bastilha")).toBeInTheDocument();
    expect(screen.getByText("História · Revolução Francesa")).toBeInTheDocument();
    expect(screen.getByText("há 12 dias")).toBeInTheDocument();
    expect(screen.getByText("estudado hoje")).toBeInTheDocument();
    expect(screen.getByText("Para reforçar")).toBeInTheDocument();
    expect(screen.getByText("Revisão")).toBeInTheDocument();
  });

  it("Estudar dispara a ação com a sugestão correspondente", () => {
    const onEstudar = vi.fn();
    render(<RecomendacaoTip recomendacoes={[base, segunda]} onEstudar={onEstudar} />);

    fireEvent.click(screen.getByRole("button", { name: "Estudar Queda da Bastilha" }));

    expect(onEstudar).toHaveBeenCalledWith(segunda);
  });
});
