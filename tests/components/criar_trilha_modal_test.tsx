// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  criarTrilha: vi.fn(),
  verificarTrilha: vi.fn(),
  estudarTrilha: vi.fn(),
  tratarErro: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/lib/trilhas", () => ({
  criarTrilha: mocks.criarTrilha,
  verificarTrilha: mocks.verificarTrilha,
  estudarTrilha: mocks.estudarTrilha,
}));
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
  const handlers = { onClose: vi.fn(), onCriada: vi.fn(), onLimite: vi.fn(), onUsada: vi.fn() };
  render(<CriarTrilhaModal open cota={cota(1)} {...handlers} {...props} />);
  return handlers;
}

function preencher(nome = "Química", tema = "Alcanos") {
  fireEvent.change(screen.getByLabelText("Nome da trilha"), { target: { value: nome } });
  fireEvent.change(screen.getByLabelText("Primeiro tema"), { target: { value: tema } });
}

const similar = (id: string, nome: string, similaridade: number, estudando = false) => ({
  id,
  nome,
  descricao: null,
  verificada: true,
  autor_nome: null,
  votos: 0,
  meu_voto: null,
  temas: 2,
  modulos: 6,
  alunos: 5,
  estudando,
  propria: false,
  pronta: true,
  created_at: "2026-01-01T00:00:00Z",
  similaridade,
});

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.verificarTrilha.mockImplementation(async (nome: string) => ({
    status: "nova",
    nome_normalizado: nome,
    similares: [],
  }));
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

  it("cria com o título corrigido pela IA quando a trilha é nova", async () => {
    mocks.verificarTrilha.mockResolvedValue({ status: "nova", nome_normalizado: "Época Napoleão", similares: [] });
    mocks.criarTrilha.mockResolvedValue("m1");
    const { onCriada } = montar();

    preencher("epoca napoleao");
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));

    await waitFor(() => expect(onCriada).toHaveBeenCalled());
    expect(mocks.verificarTrilha).toHaveBeenCalledWith("epoca napoleao", null);
    expect(mocks.criarTrilha).toHaveBeenCalledWith(expect.objectContaining({ nome: "Época Napoleão" }));
  });

  it("se a verificação falhar, cria normalmente", async () => {
    mocks.verificarTrilha.mockRejectedValue(new ApiError("Falha", 500));
    mocks.criarTrilha.mockResolvedValue("m1");
    const { onCriada } = montar();

    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));

    await waitFor(() => expect(onCriada).toHaveBeenCalled());
    expect(mocks.criarTrilha).toHaveBeenCalledWith(expect.objectContaining({ nome: "Química" }));
  });

  it("trilha igual: avisa, lista a existente e não cria nada ainda", async () => {
    mocks.verificarTrilha.mockResolvedValue({
      status: "igual",
      nome_normalizado: "Química",
      similares: [similar("m9", "Química Geral", 0.97)],
    });
    montar();

    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));

    expect(await screen.findByText(/Já existe uma trilha igual/)).toBeInTheDocument();
    expect(screen.getByText("Química Geral")).toBeInTheDocument();
    expect(screen.getByText("97% parecida")).toBeInTheDocument();
    expect(mocks.criarTrilha).not.toHaveBeenCalled();
  });

  it("trilhas parecidas: usar uma delas adiciona aos estudos sem criar nem gastar crédito", async () => {
    mocks.verificarTrilha.mockResolvedValue({
      status: "parecidas",
      nome_normalizado: "Química",
      similares: [similar("m1", "Química Geral", 0.88), similar("m2", "Química Orgânica", 0.8)],
    });
    mocks.estudarTrilha.mockResolvedValue({ materia_id: "m2", estudando: true });
    const { onUsada, onClose } = montar();

    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));
    await screen.findByText(/Encontramos trilhas parecidas/);
    fireEvent.click(screen.getByRole("button", { name: "Usar a trilha Química Orgânica" }));

    await waitFor(() => expect(onUsada).toHaveBeenCalledWith(expect.objectContaining({ id: "m2" })));
    expect(mocks.estudarTrilha).toHaveBeenCalledWith("m2");
    expect(mocks.criarTrilha).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("usar uma trilha que o aluno já estuda não chama estudar de novo", async () => {
    mocks.verificarTrilha.mockResolvedValue({
      status: "igual",
      nome_normalizado: "Química",
      similares: [similar("m1", "Química Geral", 0.99, true)],
    });
    const { onUsada } = montar();

    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));
    await screen.findByText(/Já existe uma trilha igual/);
    fireEvent.click(screen.getByRole("button", { name: "Usar a trilha Química Geral" }));

    await waitFor(() => expect(onUsada).toHaveBeenCalled());
    expect(mocks.estudarTrilha).not.toHaveBeenCalled();
  });

  it("criar mesmo assim cria com o título corrigido e avisa que gasta 1 crédito", async () => {
    mocks.verificarTrilha.mockResolvedValue({
      status: "parecidas",
      nome_normalizado: "Química Orgânica",
      similares: [similar("m1", "Química Geral", 0.8)],
    });
    mocks.criarTrilha.mockResolvedValue("m3");
    const { onCriada } = montar();

    preencher("quimica organica");
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));
    await screen.findByText(/Encontramos trilhas parecidas/);
    fireEvent.click(screen.getByRole("button", { name: "Criar mesmo assim (gasta 1 crédito)" }));

    await waitFor(() => expect(onCriada).toHaveBeenCalled());
    expect(mocks.criarTrilha).toHaveBeenCalledWith(expect.objectContaining({ nome: "Química Orgânica" }));
  });

  it("voltar devolve o formulário preenchido", async () => {
    mocks.verificarTrilha.mockResolvedValue({
      status: "parecidas",
      nome_normalizado: "Química",
      similares: [similar("m1", "Química Geral", 0.8)],
    });
    montar();

    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Criar trilha" }));
    await screen.findByText(/Encontramos trilhas parecidas/);
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(screen.getByLabelText("Nome da trilha")).toHaveValue("Química");
  });
});
