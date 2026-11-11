// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApelidoForm } from "@/components/profile_components/apelido_form";
import { ApiError } from "@/lib/api";

const { getApelido, definirApelido, toast } = vi.hoisted(() => ({
  getApelido: vi.fn(),
  definirApelido: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/apelido", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/apelido")>()),
  getApelido,
  definirApelido,
}));
vi.mock("sonner", () => ({ toast }));

describe("ApelidoForm", () => {
  beforeEach(() => {
    getApelido.mockResolvedValue({ apelido: null });
  });

  it("salva o apelido digitado", async () => {
    definirApelido.mockResolvedValue({ apelido: "Ana Lu" });
    render(<ApelidoForm />);
    const campo = await screen.findByLabelText("Apelido");
    await waitFor(() => expect(campo).not.toBeDisabled());

    fireEvent.change(campo, { target: { value: "Ana Lu" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar apelido" }));

    await waitFor(() => expect(definirApelido).toHaveBeenCalledWith("Ana Lu"));
    expect(toast.success).toHaveBeenCalledWith("Apelido salvo.");
  });

  it("avisa junto do campo quando o apelido já está em uso", async () => {
    definirApelido.mockRejectedValue(new ApiError("em uso", 409, "em uso", "apelido_em_uso"));
    render(<ApelidoForm />);
    const campo = await screen.findByLabelText("Apelido");
    await waitFor(() => expect(campo).not.toBeDisabled());

    fireEvent.change(campo, { target: { value: "Bruno" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar apelido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Este apelido já está em uso");
    expect(campo).toHaveAttribute("aria-invalid", "true");
  });

  it("não envia um apelido fora da regra", async () => {
    render(<ApelidoForm />);
    const campo = await screen.findByLabelText("Apelido");
    await waitFor(() => expect(campo).not.toBeDisabled());

    fireEvent.change(campo, { target: { value: "ab" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar apelido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("de 3 a 20 caracteres");
    expect(definirApelido).not.toHaveBeenCalled();
  });

  it("mostra o apelido atual e mantém o botão desligado até mudar", async () => {
    getApelido.mockResolvedValue({ apelido: "Ana Lu" });
    render(<ApelidoForm />);

    await waitFor(() => expect(screen.getByLabelText("Apelido")).toHaveValue("Ana Lu"));
    expect(screen.getByRole("button", { name: "Salvar apelido" })).toBeDisabled();
  });
});
