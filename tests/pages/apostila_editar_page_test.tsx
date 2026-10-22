// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  obterMateria: vi.fn(),
  selecionarMateria: vi.fn(),
  userId: "u1" as string | null,
  carregandoSessao: false,
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, push: vi.fn() }) }));
vi.mock("@/hooks/use_session", () => ({
  useSession: () => ({ user: mocks.userId ? { id: mocks.userId } : null, carregando: mocks.carregandoSessao }),
}));
vi.mock("@/lib/materias", () => ({ obterMateria: mocks.obterMateria }));
vi.mock("@/hooks/use_content_manager", () => ({
  useContentManager: () => ({
    materias: [{ id: "mat1", nome: "História", descricao: "", created_at: "" }],
    materiaAtual: { id: "mat1", nome: "História", descricao: "", created_at: "" },
    temas: [],
    temaAtual: null,
    modulos: [],
    moduloAtual: null,
    carregandoMaterias: false,
    carregandoTemas: false,
    carregandoModulos: false,
    executando: null,
    selecionarMateria: mocks.selecionarMateria,
    selecionarTema: vi.fn(),
    selecionarModulo: vi.fn(),
    adicionarTema: vi.fn(),
    editarTema: vi.fn(),
    excluirTema: vi.fn(),
    regenerarTemaComIa: vi.fn(),
    adicionarModulo: vi.fn(),
    gerarModulosComIa: vi.fn(),
    editarModulo: vi.fn(),
    excluirModulo: vi.fn(),
    regenerarModuloComIa: vi.fn(),
    regenerarQuestionarioComIa: vi.fn(),
  }),
}));
vi.mock("@/components/sidenav_components/sidenav", () => ({ Sidenav: () => null }));
vi.mock("@/components/layout_components/app_header", () => ({
  AppHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock("@/components/admin_components/tema_section", () => ({
  TemaSection: () => <div>temas-section</div>,
}));
vi.mock("@/components/admin_components/modulo_section", () => ({
  ModuloSection: () => <div>modulos-section</div>,
}));

import ApostilaEditarPage from "@/app/apostilas/[materiaId]/editar/apostila_editar_page";

beforeEach(() => {
  mocks.replace.mockReset();
  mocks.obterMateria.mockReset();
  mocks.selecionarMateria.mockReset();
  mocks.userId = "u1";
  mocks.carregandoSessao = false;
});

describe("ApostilaEditarPage - guarda de dono e editor", () => {
  it("seleciona a matéria no editor e libera os painéis para o dono", async () => {
    mocks.obterMateria.mockResolvedValue({ id: "mat1", owner_user_id: "u1" });

    render(<ApostilaEditarPage materiaId="mat1" />);

    await waitFor(() => expect(mocks.selecionarMateria).toHaveBeenCalledWith("mat1"));
    expect(await screen.findByText("temas-section")).toBeTruthy();
    expect(screen.getByText("modulos-section")).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redireciona não-dono para a leitura", async () => {
    mocks.obterMateria.mockResolvedValue({ id: "mat1", owner_user_id: "u2" });

    render(<ApostilaEditarPage materiaId="mat1" />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/apostilas/mat1"));
    expect(screen.queryByText("temas-section")).toBeNull();
  });

  it("não edita o currículo oficial (sem dono) por aqui", async () => {
    mocks.obterMateria.mockResolvedValue({ id: "mat1", owner_user_id: null });

    render(<ApostilaEditarPage materiaId="mat1" />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/apostilas/mat1"));
  });
});
