// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsumoIaPainel } from "@/components/admin_components/consumo_ia_painel";
import type { ConsumoIa } from "@/lib/ia_consumo";

const { getConsumoIa } = vi.hoisted(() => ({ getConsumoIa: vi.fn() }));

vi.mock("@/lib/ia_consumo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ia_consumo")>()),
  getConsumoIa,
}));

const consumo: ConsumoIa = {
  periodo_dias: 30,
  chamadas: 1250,
  falhas: 7,
  tokens_entrada: 90000,
  tokens_saida: 30000,
  por_operacao: [
    { chave: "conversar_com_agente", rotulo: null, chamadas: 900, falhas: 5, tokens_entrada: 70000, tokens_saida: 20000 },
    { chave: "gerar_questionario", rotulo: null, chamadas: 350, falhas: 2, tokens_entrada: 20000, tokens_saida: 10000 },
  ],
  por_usuario: [{ chave: "aluno-7", rotulo: "Ana Souza", chamadas: 600, falhas: 1, tokens_entrada: 50000, tokens_saida: 10000 }],
};

describe("ConsumoIaPainel", () => {
  beforeEach(() => {
    getConsumoIa.mockResolvedValue(consumo);
  });

  it("mostra os totais e as tabelas por operação e por usuário", async () => {
    render(<ConsumoIaPainel />);

    expect(await screen.findByText("1.250")).toBeInTheDocument();
    expect(screen.getByText("Tokens de entrada").previousElementSibling).toHaveTextContent("90.000");
    expect(screen.getByText("Tokens de saída").previousElementSibling).toHaveTextContent("30.000");
    expect(getConsumoIa).toHaveBeenCalledWith(30);

    const porOperacao = screen.getByRole("region", { name: "Por operação" });
    expect(within(porOperacao).getByText("conversar_com_agente")).toBeInTheDocument();
    expect(within(porOperacao).getByText("90.000")).toBeInTheDocument();

    const porUsuario = screen.getByRole("region", { name: "Por usuário (top 10)" });
    expect(within(porUsuario).getByText("Ana Souza")).toBeInTheDocument();
    expect(within(porUsuario).queryByText("aluno-7")).not.toBeInTheDocument();
  });

  it("refaz a consulta ao trocar o período", async () => {
    render(<ConsumoIaPainel />);
    await screen.findByText("1.250");

    fireEvent.click(screen.getByRole("button", { name: "7 dias" }));

    await waitFor(() => expect(getConsumoIa).toHaveBeenLastCalledWith(7));
    expect(screen.getByRole("button", { name: "7 dias" })).toHaveAttribute("aria-pressed", "true");
  });

  it("ignora a resposta antiga quando o período muda antes dela chegar", async () => {
    let resolverLenta: (valor: ConsumoIa) => void = () => {};
    getConsumoIa.mockReturnValueOnce(new Promise<ConsumoIa>((resolve) => (resolverLenta = resolve)));
    getConsumoIa.mockResolvedValueOnce({ ...consumo, periodo_dias: 7, chamadas: 42 });
    render(<ConsumoIaPainel />);

    fireEvent.click(screen.getByRole("button", { name: "7 dias" }));
    expect(await screen.findByText("42")).toBeInTheDocument();

    resolverLenta({ ...consumo, chamadas: 9999 });
    await Promise.resolve();

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.queryByText("9.999")).not.toBeInTheDocument();
  });

  it("mostra mensagem vazia quando não há chamadas no período", async () => {
    getConsumoIa.mockResolvedValue({ ...consumo, chamadas: 0, por_operacao: [], por_usuario: [] });
    render(<ConsumoIaPainel />);

    expect(await screen.findAllByText("Sem chamadas no período.")).toHaveLength(2);
  });

  it("permite tentar de novo quando a consulta falha", async () => {
    getConsumoIa.mockRejectedValueOnce(new Error("falhou"));
    render(<ConsumoIaPainel />);

    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("1.250")).toBeInTheDocument();
  });
});
