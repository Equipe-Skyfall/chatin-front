// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RankingList } from "@/components/progresso_components/ranking_list";
import type { Ranking } from "@/lib/xp";

const base = { carregando: false, erro: false, podeExpandir: false, onExpandir: vi.fn(), onTentarNovamente: vi.fn() };

const ranking: Ranking = {
  entradas: [
    { posicao: 1, apelido: "Bruno", xp: 900, eu: false },
    { posicao: 2, apelido: "Ana Lu", xp: 700, eu: true },
  ],
  minha_posicao: { posicao: 2, apelido: "Ana Lu", xp: 700, eu: true },
};

describe("RankingList", () => {
  it("lista posição, apelido e XP e destaca a linha do próprio aluno", () => {
    render(<RankingList {...base} ranking={ranking} />);

    const linhas = screen.getAllByRole("listitem");
    expect(linhas).toHaveLength(2);
    expect(within(linhas[0]).getByText("Bruno")).toBeInTheDocument();
    expect(within(linhas[0]).getByText("1º")).toBeInTheDocument();
    expect(within(linhas[0]).getByText("900 XP")).toBeInTheDocument();
    expect(linhas[0]).not.toHaveAttribute("aria-current");
    expect(linhas[1]).toHaveAttribute("aria-current", "true");
    expect(within(linhas[1]).getByText("você")).toBeInTheDocument();
  });

  it("fixa a posição do aluno abaixo da lista quando ele está fora dela", () => {
    const fora: Ranking = {
      entradas: [{ posicao: 1, apelido: "Bruno", xp: 900, eu: false }],
      minha_posicao: { posicao: 57, apelido: "Ana Lu", xp: 12, eu: true },
    };
    render(<RankingList {...base} ranking={fora} />);

    const minha = screen.getByRole("list", { name: "Sua posição" });
    expect(within(minha).getByText("57º")).toBeInTheDocument();
    expect(within(minha).getByText("Ana Lu")).toBeInTheDocument();
  });

  it("não repete a posição do aluno quando ele já está na lista", () => {
    render(<RankingList {...base} ranking={ranking} />);

    expect(screen.queryByRole("list", { name: "Sua posição" })).not.toBeInTheDocument();
  });

  it("mostra o estado vazio quando ninguém tem XP", () => {
    render(<RankingList {...base} ranking={{ entradas: [], minha_posicao: null }} />);

    expect(screen.getByText(/Ainda ninguém tem XP/)).toBeInTheDocument();
  });

  it("oferece 'Ver mais' só quando dá para expandir", () => {
    const onExpandir = vi.fn();
    const { rerender } = render(<RankingList {...base} ranking={ranking} />);
    expect(screen.queryByRole("button", { name: "Ver mais" })).not.toBeInTheDocument();

    rerender(<RankingList {...base} ranking={ranking} podeExpandir onExpandir={onExpandir} />);
    fireEvent.click(screen.getByRole("button", { name: "Ver mais" }));

    expect(onExpandir).toHaveBeenCalledTimes(1);
  });

  it("permite tentar de novo quando falha", () => {
    const onTentarNovamente = vi.fn();
    render(<RankingList {...base} ranking={null} erro onTentarNovamente={onTentarNovamente} />);

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onTentarNovamente).toHaveBeenCalledTimes(1);
  });
});
