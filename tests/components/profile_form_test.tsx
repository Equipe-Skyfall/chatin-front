// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  atualizarPerfil: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast: mocks.toast }));
vi.mock("@/lib/auth", () => ({ atualizarPerfil: mocks.atualizarPerfil }));

import { ProfileForm } from "@/components/profile_components/ProfileForm";

const perfil = {
  id: "u1",
  username: "ana",
  email: "ana@chatin.com",
  role: "USER" as const,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

function abrirEdicao() {
  render(<ProfileForm profile={perfil} onUpdated={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Editar Perfil/ }));
}

beforeEach(() => {
  mocks.atualizarPerfil.mockReset();
});

describe("ProfileForm (edição de perfil)", () => {
  it("não salva com underscore no usuário e avisa sobre caracteres especiais", async () => {
    abrirEdicao();

    fireEvent.change(screen.getByLabelText("Usuário"), { target: { value: "ana_silva" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith("Não são permitidos caracteres especiais no nome de usuário")
    );
    expect(mocks.atualizarPerfil).not.toHaveBeenCalled();
  });

  it("salva quando o usuário é válido", async () => {
    mocks.atualizarPerfil.mockResolvedValue(perfil);
    abrirEdicao();

    fireEvent.change(screen.getByLabelText("Usuário"), { target: { value: "ana2" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() =>
      expect(mocks.atualizarPerfil).toHaveBeenCalledWith("u1", { username: "ana2", email: "ana@chatin.com" })
    );
    expect(mocks.toast.success).toHaveBeenCalledWith("Perfil atualizado com sucesso!");
  });
});
