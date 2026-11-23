import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ studyRequest: vi.fn() }));

import { studyRequest } from "@/lib/api";
import { apelidoValido, garantirApelidoPadrao } from "@/lib/apelido";

const studyRequestMock = vi.mocked(studyRequest);

describe("apelidoValido", () => {
  it.each(["Ana", "Ana Lu", "joão_2", "a.b-c", "  Ana   Lu "])("aceita %j", (apelido) => {
    expect(apelidoValido(apelido)).toBe(true);
  });

  it.each(["", "ab", "x".repeat(21), "ana@gmail.com", "a/b/c", "   "])("recusa %j", (apelido) => {
    expect(apelidoValido(apelido)).toBe(false);
  });
});

describe("garantirApelidoPadrao", () => {
  beforeEach(() => {
    studyRequestMock.mockReset();
  });

  it("usa o nome de usuário quando o aluno ainda não tem apelido", async () => {
    studyRequestMock
      .mockResolvedValueOnce({ apelido: null })
      .mockResolvedValueOnce({ apelido: "joaorossi" });

    const apelido = await garantirApelidoPadrao("joaorossi");

    expect(apelido).toBe("joaorossi");
    expect(studyRequestMock).toHaveBeenNthCalledWith(1, "/perfil/apelido", { skipCache: true });
    expect(studyRequestMock).toHaveBeenNthCalledWith(2, "/perfil/apelido", {
      method: "PATCH",
      body: JSON.stringify({ apelido: "joaorossi" }),
    });
  });

  it("não sobrescreve um apelido já escolhido", async () => {
    studyRequestMock.mockResolvedValueOnce({ apelido: "Rossi PO" });

    const apelido = await garantirApelidoPadrao("joaorossi");

    expect(apelido).toBe("Rossi PO");
    expect(studyRequestMock).toHaveBeenCalledTimes(1);
  });

  it("não grava quando o nome de usuário não cabe como apelido (mais de 20 caracteres)", async () => {
    studyRequestMock.mockResolvedValueOnce({ apelido: null });

    const apelido = await garantirApelidoPadrao("x".repeat(21));

    expect(apelido).toBeNull();
    expect(studyRequestMock).toHaveBeenCalledTimes(1);
  });

  it("não lança erro quando o apelido já é de outro aluno (409)", async () => {
    studyRequestMock
      .mockResolvedValueOnce({ apelido: null })
      .mockRejectedValueOnce(Object.assign(new Error("Apelido em uso"), { status: 409 }));

    await expect(garantirApelidoPadrao("joaorossi")).resolves.toBeNull();
  });

  it("não lança erro quando o back está indisponível", async () => {
    studyRequestMock.mockRejectedValueOnce(new Error("503"));

    await expect(garantirApelidoPadrao("joaorossi")).resolves.toBeNull();
  });
});
