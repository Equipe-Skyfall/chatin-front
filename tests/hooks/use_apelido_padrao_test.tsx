// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  user: null as null | { id: string; username: string; email: string; role: "USER" | "ADMIN" },
  garantirApelidoPadrao: vi.fn(),
}));

vi.mock("@/hooks/use_session", () => ({ useSession: () => ({ user: mocks.user }) }));
vi.mock("@/lib/apelido", () => ({ garantirApelidoPadrao: mocks.garantirApelidoPadrao }));

import { resetarApelidoPadrao, useApelidoPadrao } from "@/hooks/use_apelido_padrao";

function aluno(id = "u1", username = "joaorossi") {
  return { id, username, email: `${username}@example.com`, role: "USER" as const };
}

beforeEach(() => {
  mocks.user = null;
  mocks.garantirApelidoPadrao.mockReset().mockResolvedValue(null);
  resetarApelidoPadrao();
});

describe("useApelidoPadrao", () => {
  it("garante o apelido do aluno logado usando o nome de usuário", () => {
    mocks.user = aluno();

    renderHook(() => useApelidoPadrao());

    expect(mocks.garantirApelidoPadrao).toHaveBeenCalledWith("joaorossi");
  });

  it("não faz nada enquanto não há usuário na sessão", () => {
    renderHook(() => useApelidoPadrao());

    expect(mocks.garantirApelidoPadrao).not.toHaveBeenCalled();
  });

  it("ignora administradores, que não entram no ranking", () => {
    mocks.user = { ...aluno(), role: "ADMIN" };

    renderHook(() => useApelidoPadrao());

    expect(mocks.garantirApelidoPadrao).not.toHaveBeenCalled();
  });

  it("verifica cada usuário só uma vez por aba, mesmo com várias telas montando a navegação", () => {
    mocks.user = aluno();

    renderHook(() => useApelidoPadrao());
    renderHook(() => useApelidoPadrao());

    expect(mocks.garantirApelidoPadrao).toHaveBeenCalledTimes(1);
  });

  it("verifica de novo quando outra conta entra na mesma aba", () => {
    mocks.user = aluno("u1", "joaorossi");
    renderHook(() => useApelidoPadrao());

    mocks.user = aluno("u2", "mariasilva");
    renderHook(() => useApelidoPadrao());

    expect(mocks.garantirApelidoPadrao).toHaveBeenNthCalledWith(2, "mariasilva");
  });
});
