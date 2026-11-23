import { beforeEach, describe, expect, it, vi } from "vitest";

const { lookupSession, redirect } = vi.hoisted(() => ({
  lookupSession: vi.fn(),
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

vi.mock("@/lib/session", () => ({ lookupSession }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/app/admin/consumo-ia/consumo_ia_page", () => ({ default: () => null }));

import ConsumoIaRoute from "@/app/admin/consumo-ia/page";

describe("rota /admin/consumo-ia", () => {
  beforeEach(() => {
    redirect.mockClear();
  });

  it("manda o aluno para o início", async () => {
    lookupSession.mockResolvedValue({ status: "authenticated", user: { role: "USER" } });

    await expect(ConsumoIaRoute()).rejects.toThrow("redirect:/inicio");
  });

  it("manda quem não tem sessão para o login", async () => {
    lookupSession.mockResolvedValue({ status: "unauthenticated" });

    await expect(ConsumoIaRoute()).rejects.toThrow("redirect:/");
  });

  it("manda para o início quando a sessão não pôde ser confirmada", async () => {
    lookupSession.mockResolvedValue({ status: "unavailable" });

    await expect(ConsumoIaRoute()).rejects.toThrow("redirect:/inicio");
  });

  it("deixa o administrador entrar", async () => {
    lookupSession.mockResolvedValue({ status: "authenticated", user: { role: "ADMIN" } });

    await expect(ConsumoIaRoute()).resolves.toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });
});
