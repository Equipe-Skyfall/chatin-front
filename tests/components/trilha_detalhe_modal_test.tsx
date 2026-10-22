// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { TrilhaExplorar } from "@/interfaces/trilha_interfaces";

const mocks = vi.hoisted(() => ({ obterTrilhaDetalhe: vi.fn() }));
vi.mock("@/lib/trilhas", () => ({ obterTrilhaDetalhe: mocks.obterTrilhaDetalhe }));

import { TrilhaDetalheModal } from "@/components/explorar_components/trilha_detalhe_modal";

function trilha(extra: Partial<TrilhaExplorar> = {}): TrilhaExplorar {
  return {
    id: "t1",
    nome: "Química Orgânica",
    descricao: "Do zero",
    verificada: false,
    autor_nome: "Ana",
    votos: 2,
    meu_voto: null,
    temas: 1,
    modulos: 2,
    alunos: 3,
    estudando: false,
    propria: false,
    pronta: true,
    created_at: "2026-10-01T00:00:00Z",
    ...extra,
  };
}

function montar(t: TrilhaExplorar | null) {
  const handlers = {
    onClose: vi.fn(),
    onEstudar: vi.fn(),
    onPararDeEstudar: vi.fn(),
    onVotar: vi.fn(),
    onConversar: vi.fn(),
  };
  render(<TrilhaDetalheModal trilha={t} ocupada={false} {...handlers} />);
  return handlers;
}

beforeEach(() => {
  mocks.obterTrilhaDetalhe.mockReset().mockResolvedValue({
    ...trilha(),
    conteudo: [
      { id: "tm1", titulo: "Hidrocarbonetos", ordem: 0, modulos: [{ id: "m1", titulo: "Alcanos", ordem: 0 }] },
    ],
  });
});

describe("TrilhaDetalheModal", () => {
  it("fechado não renderiza nem busca nada", () => {
    montar(null);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(mocks.obterTrilhaDetalhe).not.toHaveBeenCalled();
  });

  it("mostra o conteúdo carregado e o autor", async () => {
    montar(trilha());

    expect(await screen.findByText("Alcanos")).toBeInTheDocument();
    expect(screen.getByText("Hidrocarbonetos")).toBeInTheDocument();
    expect(screen.getByText(/por Ana/)).toBeInTheDocument();
    expect(mocks.obterTrilhaDetalhe).toHaveBeenCalledWith("t1");
  });

  it("trilha ainda sem módulos prontos avisa que está sendo gerada", async () => {
    mocks.obterTrilhaDetalhe.mockResolvedValue({ ...trilha(), conteudo: [] });
    montar(trilha());

    expect(await screen.findByText("Os módulos ainda estão sendo gerados.")).toBeInTheDocument();
  });

  it("falha ao carregar mostra o erro sem fechar", async () => {
    mocks.obterTrilhaDetalhe.mockRejectedValue(new Error("500"));
    montar(trilha());

    expect(await screen.findByText("Não foi possível carregar os módulos.")).toBeInTheDocument();
  });

  it("estudar e votar chamam os handlers", async () => {
    const { onEstudar, onVotar } = montar(trilha());
    await screen.findByText("Alcanos");

    fireEvent.click(screen.getByRole("button", { name: "Adicionar aos estudos" }));
    fireEvent.click(screen.getByRole("button", { name: "Gostei" }));

    expect(onEstudar).toHaveBeenCalled();
    expect(onVotar).toHaveBeenCalledWith(expect.objectContaining({ id: "t1" }), 1);
  });

  it("trilha adotada oferece parar de estudar", async () => {
    const { onPararDeEstudar } = montar(trilha({ estudando: true }));
    await screen.findByText("Alcanos");

    fireEvent.click(screen.getByRole("button", { name: "Parar de estudar" }));

    expect(onPararDeEstudar).toHaveBeenCalled();
  });

  it("trilha própria não tem como sair e abre o chat", async () => {
    const { onConversar } = montar(trilha({ propria: true, estudando: true }));
    await screen.findByText("Alcanos");

    expect(screen.queryByRole("button", { name: "Parar de estudar" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Conversar" }));

    expect(onConversar).toHaveBeenCalledWith(expect.objectContaining({ id: "t1" }));
  });

  it("verificada: sem votos nem adicionar, só conversar", async () => {
    montar(trilha({ verificada: true, autor_nome: null, estudando: true }));
    await screen.findByText("Alcanos");

    expect(screen.getByRole("button", { name: "Conversar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gostei" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Adicionar aos estudos" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Parar de estudar" })).toBeNull();
  });

  it("trilha da comunidade ainda não estudada não oferece conversar", async () => {
    montar(trilha());
    await screen.findByText("Alcanos");

    expect(screen.queryByRole("button", { name: "Conversar" })).toBeNull();
  });

  it("fecha pelo X", async () => {
    const { onClose } = montar(trilha());
    await waitFor(() => expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalled();
  });
});
