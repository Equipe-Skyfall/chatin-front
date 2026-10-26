// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TermosPage from "@/app/termos/page";

describe("Página /termos", () => {
  it("mostra os Termos de Uso com as seções principais", () => {
    render(<TermosPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 2, name: /Conteúdo gerado por inteligência artificial/ })
    ).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: /Limitação de responsabilidade/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
  });
});
