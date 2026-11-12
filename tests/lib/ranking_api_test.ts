import { beforeEach, describe, expect, it, vi } from "vitest";

const { studyRequest } = vi.hoisted(() => ({ studyRequest: vi.fn() }));

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  studyRequest,
}));

import { getRanking } from "@/lib/xp";

describe("getRanking", () => {
  beforeEach(() => studyRequest.mockReset());

  it("traduz o payload do back (nome/voce) para apelido/eu", async () => {
    studyRequest.mockResolvedValue({
      entradas: [
        { posicao: 1, nome: "Bruno", xp: 900, voce: false },
        { posicao: 2, nome: "Ana Lu", xp: 700, voce: true },
      ],
      minha_posicao: 2,
      meu_xp: 700,
    });

    const ranking = await getRanking(20);

    expect(studyRequest).toHaveBeenCalledWith("/ranking?limit=20", { skipCache: true });
    expect(ranking.entradas[1]).toEqual({ posicao: 2, apelido: "Ana Lu", xp: 700, eu: true });
    expect(ranking.minha_posicao).toEqual({ posicao: 2, apelido: "Ana Lu", xp: 700, eu: true });
  });

  it("monta a linha do aluno fora do topo a partir de minha_posicao e meu_xp", async () => {
    studyRequest.mockResolvedValue({
      entradas: [{ posicao: 1, nome: "Bruno", xp: 900, voce: false }],
      minha_posicao: 57,
      meu_xp: 12,
    });

    const ranking = await getRanking();

    expect(ranking.minha_posicao).toMatchObject({ posicao: 57, xp: 12, eu: true });
  });

  it("não tem minha_posicao enquanto o aluno não tem XP", async () => {
    studyRequest.mockResolvedValue({ entradas: [], minha_posicao: null, meu_xp: 0 });

    expect((await getRanking()).minha_posicao).toBeNull();
  });
});
