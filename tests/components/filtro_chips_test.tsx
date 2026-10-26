// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FiltroChips } from "@/components/explorar_components/filtro_chips";

const opcoes = [
  { valor: "todas", label: "Todas" },
  { valor: "verificadas", label: "Verificadas" },
] as const;

describe("FiltroChips", () => {
  it("marca só a opção ativa com aria-pressed", () => {
    render(<FiltroChips rotulo="Origem" opcoes={[...opcoes]} valor="verificadas" onChange={() => {}} />);

    expect(screen.getByRole("group", { name: "Origem" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verificadas" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "false");
  });

  it("avisa a escolha", () => {
    const onChange = vi.fn();
    render(<FiltroChips rotulo="Origem" opcoes={[...opcoes]} valor="todas" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Verificadas" }));

    expect(onChange).toHaveBeenCalledWith("verificadas");
  });
});
