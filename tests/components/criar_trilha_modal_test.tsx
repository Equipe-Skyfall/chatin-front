// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  criarTrilha: vi.fn(),
  tratarErro: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/lib/trilhas", () => ({ criarTrilha: mocks.criarTrilha }));
vi.mock("@/hooks/use_study_error", () => ({ useStudyErrorHandler: () => mocks.tratarErro }));
vi.mock("sonner", () => ({ toast: { success: mocks.success, error: mocks.error } }));

import { CriarTrilhaModal } from "@/components/explorar_components/criar_trilha_modal";

const cota = (usadas: number) => ({
  limite: 3,
  usadas,
  restantes: Math.max(0, 3 - usadas),
  reseta_em: "2026-11-01T00:00:00-03:00",
});

function montar(props: Partial<React.ComponentProps<typeof CriarTrilhaModal>> = {}) {
  const handlers = { onClose: vi.fn(), onCriada: vi.fn(), onLimite: vi.fn() };
  render(<CriarTrilhaModal open cota={cota(1)} {...handlers} {...props} />);
  return handlers;
}

function preencher(nome = "Química", tema = "Alcanos") {
  fireEvent.change(screen.getByLabelText("Nome da trilha"), { target: { value: nome } });
  fireEvent.change(screen.getByLabelText("Primeiro tema"), { target: { value: tema } });
}

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
});

describe("CriarTrilhaModal", () => {
  it("é um diálogo com a cota do mês e o botão desabilitado até preencher", () => {
    montar();

    expect(screen.getByRole("dialog", { name: "Criar trilha" })).toBeInTheDocument();
    expect(screen.getByText("1 de 3 trilhas criadas este mês")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar trilha" })).toBeDisabled();
  });

  it("cria a trilha com os campos limpos e avisa que a IA está gerando os módulos", async () => {
    mocks.criarTrilha.mockResolvedValue("m1");
    const { onCriada, onClose } = montar();

    preencher("  Química  ", " Alcanos ");
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));

    await waitFor(() => expect(onCriada).toHaveBeenCalled());
    expect(mocks.criarTrilha).toHaveBeenCalledWith({
      nome: "Química",
      descricao: null,
      tema_titulo: "Alcanos",
      direcionamento: null,
    });
    expect(mocks.success).toHaveBeenCalledWith(expect.stringContaining("gerando os módulos"));
    expect(onClose).toHaveBeenCalled();
  });

  it("com a cota esgotada não deixa criar e explica", () => {
    montar({ cota: cota(3) });

    expect(screen.getByRole("alert")).toHaveTextContent("usou todas as trilhas deste mês");
    expect(screen.getByLabelText("Nome da trilha")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Criar trilha" })).toBeDisabled();
  });

  it("limite mensal barrado pelo back mostra a mensagem e pede a releitura da cota", async () => {
    mocks.criarTrilha.mockRejectedValue(
      new ApiError("Limite", 403, "Você já criou 3 trilhas neste mês.", "LIMITE_TRILHAS_MENSAL")
    );
    const { onLimite, onCriada } = montar();

    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));

    await waitFor(() => expect(onLimite).toHaveBeenCalled());
    expect(mocks.error).toHaveBeenCalledWith("Você já criou 3 trilhas neste mês.");
    expect(onCriada).not.toHaveBeenCalled();
    expect(mocks.tratarErro).not.toHaveBeenCalled();
  });

  it("outro erro vai para o tratador, com aviso de IA, e mantém o modal aberto", async () => {
    const erro = new ApiError("Falha", 503);
    mocks.criarTrilha.mockRejectedValue(erro);
    const { onClose, onCriada } = montar();

    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));

    await waitFor(() => expect(mocks.tratarErro).toHaveBeenCalledWith(erro, { ia: true }));
    expect(onClose).not.toHaveBeenCalled();
    expect(onCriada).not.toHaveBeenCalled();
  });
});
