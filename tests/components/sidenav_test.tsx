// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  pathname: "/chat",
  role: "USER" as "USER" | "ADMIN" | null,
  push: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  limparSessao: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));
vi.mock("@/lib/auth", () => ({ logout: mocks.logout }));
vi.mock("@/hooks/use_session", () => ({
  useSession: () => ({ role: mocks.role }),
  limparSessao: mocks.limparSessao,
}));

import { Sidenav } from "@/components/sidenav_components/sidenav";

beforeEach(() => {
  mocks.pathname = "/chat";
  mocks.role = "USER";
  mocks.logout.mockResolvedValue(undefined);
});

describe("Sidenav (navegação lateral)", () => {
  it("aluno vê as páginas comuns, mas não 'Criar conteúdo'", () => {
    render(<Sidenav />);

    for (const nome of ["Início", "Biblioteca", "Questionários", "Progresso", "Perfil"]) {
      expect(screen.getByRole("link", { name: nome })).toBeInTheDocument();
    }
    expect(screen.queryByRole("link", { name: "Criar conteúdo" })).not.toBeInTheDocument();
  });

  it("admin vê 'Criar conteúdo'", () => {
    mocks.role = "ADMIN";
    render(<Sidenav />);

    expect(screen.getByRole("link", { name: "Criar conteúdo" })).toHaveAttribute("href", "/conteudo");
  });

  it("marca a página atual com aria-current", () => {
    mocks.pathname = "/quiz";
    render(<Sidenav />);

    expect(screen.getByRole("link", { name: "Questionários" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("sair: encerra a sessão e volta para o login", async () => {
    render(<Sidenav />);

    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/"));
    expect(mocks.logout).toHaveBeenCalled();
    expect(mocks.limparSessao).toHaveBeenCalled();
    expect(mocks.refresh).toHaveBeenCalled();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Você saiu da sua conta.");
  });
});
