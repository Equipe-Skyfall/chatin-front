// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Materia } from "@/lib/materias";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  deletarMateria: vi.fn(),
  recarregar: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  materias: [] as Materia[],
  userId: "u1" as string | null,
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/hooks/use_materias", () => ({
  useMaterias: () => ({ materias: mocks.materias, carregando: false, erro: false, recarregar: mocks.recarregar }),
}));
vi.mock("@/hooks/use_session", () => ({
  useSession: () => ({ user: mocks.userId ? { id: mocks.userId } : null }),
}));
vi.mock("@/hooks/use_geracao_apostila", () => ({
  useGeracaoApostila: () => ({ geracoes: [] }),
}));
vi.mock("@/lib/content", () => ({ deletarMateria: mocks.deletarMateria }));
vi.mock("@/lib/errorMessages", () => ({ getFriendlyErrorMessage: () => "erro amigável" }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/layout_components/app_header", () => ({
  AppHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock("@/components/materias_components/criar_materia_dialog", () => ({
  CriarMateriaDialog: ({ open }: { open: boolean }) => (open ? <div>criar-dialog</div> : null),
}));
vi.mock("@/components/materias_components/editar_materia_dialog", () => ({
  EditarMateriaDialog: ({ materia }: { materia: { id: string } | null }) =>
    materia ? <div>editar-dialog-{materia.id}</div> : null,
}));
vi.mock("@/components/profile_components/confirm_dialog", () => ({
  ConfirmDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? (
      <div>
        confirm-dialog
        <button type="button" onClick={onConfirm}>
          confirmar exclusão
        </button>
      </div>
    ) : null,
}));

import ApostilasPage from "@/app/apostilas/apostilas_page";

function materia(overrides: Partial<Materia>): Materia {
  return {
    id: "m1",
    nome: "História",
    descricao: "Revoluções",
    owner_user_id: "u1",
    votos: 0,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  mocks.push.mockReset();
  mocks.recarregar.mockReset();
  mocks.toastSuccess.mockReset();
  mocks.toastError.mockReset();
  mocks.deletarMateria.mockReset().mockResolvedValue(undefined);
  mocks.userId = "u1";
  mocks.materias = [];
});

describe("ApostilasPage - criar e gerenciar apostilas", () => {
  it("abre o dialog de nova apostila", () => {
    render(<ApostilasPage />);

    fireEvent.click(screen.getByRole("button", { name: /Nova apostila/ }));

    expect(screen.getByText("criar-dialog")).toBeTruthy();
  });

  it("mostra ações apenas nas apostilas do próprio aluno", () => {
    mocks.materias = [materia({ id: "m1" }), materia({ id: "m2", owner_user_id: "u2" })];

    render(<ApostilasPage />);

    expect(screen.getAllByRole("button", { name: "Editar" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Excluir" })).toHaveLength(1);
  });

  it("editar abre o dialog com a apostila selecionada", () => {
    mocks.materias = [materia({ id: "m1" })];

    render(<ApostilasPage />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByText("editar-dialog-m1")).toBeTruthy();
  });

  it("gerenciar conteúdo navega para a edição da apostila", () => {
    mocks.materias = [materia({ id: "m1" })];

    render(<ApostilasPage />);
    fireEvent.click(screen.getByRole("button", { name: "Conteúdo" }));

    expect(mocks.push).toHaveBeenCalledWith("/apostilas/m1/editar");
  });

  it("excluir pede confirmação e recarrega a lista", async () => {
    mocks.materias = [materia({ id: "m1" })];

    render(<ApostilasPage />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByText("confirm-dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "confirmar exclusão" }));

    await waitFor(() => expect(mocks.deletarMateria).toHaveBeenCalledWith("m1"));
    expect(mocks.toastSuccess).toHaveBeenCalled();
    await waitFor(() => expect(mocks.recarregar).toHaveBeenCalled());
  });
});
