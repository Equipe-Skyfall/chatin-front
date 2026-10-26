// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Materia } from "@/lib/materias";

const mocks = vi.hoisted(() => ({ atualizarMateria: vi.fn() }));

vi.mock("@/lib/content", () => ({ atualizarMateria: mocks.atualizarMateria }));
vi.mock("@/lib/errorMessages", () => ({ getFriendlyErrorMessage: () => "erro amigável" }));

import { EditarMateriaDialog } from "@/components/materias_components/editar_materia_dialog";

const materia: Materia = {
  id: "mat1",
  nome: "História",
  descricao: "Revoluções",
  owner_user_id: "u1",
  votos: 0,
  created_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  mocks.atualizarMateria.mockReset().mockResolvedValue(undefined);
});

describe("EditarMateriaDialog", () => {
  it("salva nome e descrição, avisa o pai e fecha", async () => {
    const onSalva = vi.fn();
    const onClose = vi.fn();

    render(<EditarMateriaDialog materia={materia} onClose={onClose} onSalva={onSalva} />);

    fireEvent.change(screen.getByLabelText("Nome da matéria"), { target: { value: "História Geral" } });
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Do zero" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    await waitFor(() =>
      expect(mocks.atualizarMateria).toHaveBeenCalledWith("mat1", { nome: "História Geral", descricao: "Do zero" })
    );
    expect(onSalva).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não renderiza sem matéria selecionada", () => {
    const { container } = render(<EditarMateriaDialog materia={null} onClose={vi.fn()} onSalva={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o erro e não fecha quando a API falha", async () => {
    mocks.atualizarMateria.mockRejectedValue(new Error("boom"));
    const onClose = vi.fn();

    render(<EditarMateriaDialog materia={materia} onClose={onClose} onSalva={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    await waitFor(() => expect(screen.getByText("erro amigável")).toBeTruthy());
    expect(onClose).not.toHaveBeenCalled();
  });
});
