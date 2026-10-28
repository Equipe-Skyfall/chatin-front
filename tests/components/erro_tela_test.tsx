// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Error from "@/app/error";
import NotFound from "@/app/not-found";

describe("telas de erro", () => {
  it("error.tsx oferece tentar novamente e voltar ao início", () => {
    const reset = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<Error error={new globalThis.Error("boom")} reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Algo deu errado");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/inicio");
  });

  it("error.tsx não vaza detalhes técnicos para o aluno", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<Error error={new globalThis.Error("stack secreto")} reset={() => {}} />);

    expect(screen.queryByText(/stack secreto/)).not.toBeInTheDocument();
  });

  it("not-found.tsx só oferece voltar ao início", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/inicio");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
