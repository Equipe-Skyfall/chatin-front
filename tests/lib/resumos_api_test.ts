import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ studyRequest: vi.fn() }));

import { studyRequest } from "@/lib/api";
import { gerarResumo, listarResumos, obterResumo, urlPdfResumo } from "@/lib/resumos";

const studyRequestMock = vi.mocked(studyRequest);

beforeEach(() => {
  studyRequestMock.mockReset();
  studyRequestMock.mockResolvedValue([]);
});

describe("lib/resumos (biblioteca de resumos)", () => {
  it("lista sem query string quando não há filtros", async () => {
    await listarResumos();
    expect(studyRequestMock).toHaveBeenCalledWith("/resumos");
  });

  it("monta a paginação e o filtro de matéria na query string", async () => {
    await listarResumos({ limit: 20, offset: 40, materiaId: "m1" });
    expect(studyRequestMock).toHaveBeenCalledWith("/resumos?limit=20&offset=40&materia_id=m1");
  });

  it("envia offset 0 (valor falsy) em vez de omiti-lo", async () => {
    await listarResumos({ limit: 20, offset: 0 });
    expect(studyRequestMock).toHaveBeenCalledWith("/resumos?limit=20&offset=0");
  });

  it("busca um resumo por id", async () => {
    await obterResumo("r1");
    expect(studyRequestMock).toHaveBeenCalledWith("/resumos/r1");
  });

  it("gera resumo a partir de uma conversa", async () => {
    await gerarResumo("c1");
    expect(studyRequestMock).toHaveBeenCalledWith("/resumos", {
      method: "POST",
      body: JSON.stringify({ conversa_id: "c1" }),
    });
  });

  it("a URL do PDF passa pelo proxy autenticado, nunca direto no backend", () => {
    expect(urlPdfResumo("r1")).toBe("/api/study/resumos/r1/pdf");
  });
});
