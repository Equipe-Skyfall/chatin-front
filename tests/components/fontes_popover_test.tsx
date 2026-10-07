// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FontesPopover } from "@/components/chat_components/fontes_popover";

const fontes = [
  { titulo: "Revolução Francesa", url: "https://brasilescola.uol.com.br/rf", dominio: "brasilescola.uol.com.br" },
  { titulo: "Outra página", url: "https://www.exemplo.org/a" },
];

describe("FontesPopover", () => {
  it("não renderiza nada sem fontes", () => {
    const { container } = render(<FontesPopover fontes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra a quantidade de fontes no botão", () => {
    render(<FontesPopover fontes={fontes} />);
    expect(screen.getByRole("button", { name: "2 fontes na web" })).toBeTruthy();
  });

  it("lista cada fonte como link que abre em nova aba", () => {
    render(<FontesPopover fontes={fontes} />);
    const link = screen.getByRole("link", { name: /Revolução Francesa/ });
    expect(link.getAttribute("href")).toBe("https://brasilescola.uol.com.br/rf");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("deriva o domínio da URL quando não vem do servidor", () => {
    render(<FontesPopover fontes={fontes} />);
    expect(screen.getByText("exemplo.org")).toBeTruthy();
  });
});
