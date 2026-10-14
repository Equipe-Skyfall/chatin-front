import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { moduloDaLicaoPendente, rotaComecarLicao } from "@/lib/licao";

describe("lib/licao", () => {
  it("monta a rota do chat com o botão Começar lição", () => {
    expect(rotaComecarLicao("mod-1")).toBe("/chat?modulo=mod-1&comecar=1");
  });

  it("reconhece o bloqueio do quiz e usa o módulo informado pelo back", () => {
    const erro = new ApiError("Comece a lição.", 403, "Comece a lição.", "LICAO_NAO_INICIADA", {
      modulo_id: "mod-do-erro",
    });

    expect(moduloDaLicaoPendente(erro, "mod-padrao")).toBe("mod-do-erro");
  });

  it("cai no módulo padrão quando o erro não traz modulo_id", () => {
    const erro = new ApiError("Comece a lição.", 403, null, "LICAO_NAO_INICIADA");

    expect(moduloDaLicaoPendente(erro, "mod-padrao")).toBe("mod-padrao");
  });

  it("ignora outros erros, inclusive outro 403 (módulo bloqueado)", () => {
    expect(moduloDaLicaoPendente(new ApiError("Bloqueado", 403), "m")).toBeNull();
    expect(moduloDaLicaoPendente(new Error("x"), "m")).toBeNull();
  });
});
