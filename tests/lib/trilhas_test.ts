import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  studyRequest: vi.fn(),
  criarMateria: vi.fn(),
  criarTema: vi.fn(),
}));

vi.mock("@/lib/api", () => ({ studyRequest: mocks.studyRequest }));
vi.mock("@/lib/content", () => ({ criarMateria: mocks.criarMateria, criarTema: mocks.criarTema }));

import {
  criarTrilha,
  estudarTrilha,
  explorarTrilhas,
  obterCotaTrilhas,
  obterTrilhaDetalhe,
  pararDeEstudarTrilha,
  removerVotoTrilha,
  votarTrilha,
} from "@/lib/trilhas";

beforeEach(() => {
  mocks.studyRequest.mockReset().mockResolvedValue({});
  mocks.criarMateria.mockReset().mockResolvedValue({ id: "m1" });
  mocks.criarTema.mockReset().mockResolvedValue({ id: "t1" });
});

describe("lib/trilhas", () => {
  it("explora com origem, ordem e paginação na query", async () => {
    await explorarTrilhas("comunidade", "votos", { limite: 10, offset: 20 });

    expect(mocks.studyRequest).toHaveBeenCalledWith(
      "/trilhas/explorar?origem=comunidade&ordem=votos&limite=10&offset=20"
    );
  });

  it("usa a primeira página por padrão", async () => {
    await explorarTrilhas("todas", "recentes");

    expect(mocks.studyRequest).toHaveBeenCalledWith(
      "/trilhas/explorar?origem=todas&ordem=recentes&limite=20&offset=0"
    );
  });

  it("busca detalhe, cota (sem cache), estudar e parar", async () => {
    await obterTrilhaDetalhe("m1");
    await obterCotaTrilhas();
    await estudarTrilha("m1");
    await pararDeEstudarTrilha("m1");

    expect(mocks.studyRequest.mock.calls).toEqual([
      ["/trilhas/m1"],
      ["/trilhas/cota", { skipCache: true }],
      ["/trilhas/m1/estudar", { method: "POST" }],
      ["/trilhas/m1/estudar", { method: "DELETE" }],
    ]);
  });

  it("vota e remove o voto na rota de matérias", async () => {
    await votarTrilha("m1", -1);
    await removerVotoTrilha("m1");

    expect(mocks.studyRequest.mock.calls).toEqual([
      ["/materias/m1/votar", { method: "POST", body: JSON.stringify({ valor: -1 }) }],
      ["/materias/m1/votar", { method: "DELETE" }],
    ]);
  });

  it("cria a matéria e o primeiro tema pedindo a geração dos módulos", async () => {
    const id = await criarTrilha({
      nome: "Química",
      descricao: "Orgânica",
      tema_titulo: "Alcanos",
      direcionamento: "Com exemplos",
    });

    expect(id).toBe("m1");
    expect(mocks.criarMateria).toHaveBeenCalledWith({ nome: "Química", descricao: "Orgânica" });
    expect(mocks.criarTema).toHaveBeenCalledWith("m1", {
      titulo: "Alcanos",
      direcionamento: "Com exemplos",
      gerar_modulos: true,
    });
  });

  it("não cria o tema se a matéria falhar (limite mensal)", async () => {
    mocks.criarMateria.mockRejectedValue(new Error("403"));

    await expect(criarTrilha({ nome: "X", tema_titulo: "Y" })).rejects.toThrow("403");
    expect(mocks.criarTema).not.toHaveBeenCalled();
  });
});
