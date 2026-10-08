// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
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

    expect(screen.getByRole("button", { name: "2 fontes na web" })).toBeInTheDocument();
  });

  it("lista cada fonte como link que abre em nova aba", () => {
    render(<FontesPopover fontes={fontes} />);

    const link = screen.getByRole("link", { name: /Revolução Francesa/ });
    expect(link).toHaveAttribute("href", "https://brasilescola.uol.com.br/rf");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("mostra o domínio explícito vindo do servidor", () => {
    render(<FontesPopover fontes={fontes} />);

    expect(screen.getByText("brasilescola.uol.com.br")).toBeInTheDocument();
  });

  it("deriva o domínio da URL, sem 'www.', quando o servidor não envia", () => {
    render(<FontesPopover fontes={fontes} />);

    expect(screen.getByText("exemplo.org")).toBeInTheDocument();
  });

  it("descarta links que não são http(s), como javascript:", () => {
    render(
      <FontesPopover
        fontes={[
          { titulo: "Perigosa", url: "javascript:alert(1)" },
          { titulo: "Boa", url: "https://boa.org/x" },
        ]}
      />
    );

    expect(screen.queryByRole("link", { name: /Perigosa/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Boa/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1 fonte na web" })).toBeInTheDocument();
  });

  it("não renderiza nada quando todas as URLs são inválidas", () => {
    const { container } = render(
      <FontesPopover fontes={[{ titulo: "x", url: "não é url" }, { titulo: "y", url: "data:text/html,oi" }]} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("aceita a mesma URL duas vezes sem quebrar", () => {
    render(
      <FontesPopover
        fontes={[
          { titulo: "Repetida", url: "https://a.org/x" },
          { titulo: "Repetida", url: "https://a.org/x" },
        ]}
      />
    );

    expect(screen.getAllByRole("link", { name: /Repetida/ })).toHaveLength(2);
  });

  it("alterna aberto/fechado ao tocar no botão (touch), com aria-expanded", () => {
    render(<FontesPopover fontes={fontes} />);
    const botao = screen.getByRole("button", { name: "2 fontes na web" });

    expect(botao).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(botao);
    expect(botao).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(botao);
    expect(botao).toHaveAttribute("aria-expanded", "false");
  });

  it("fecha com Escape", () => {
    render(<FontesPopover fontes={fontes} />);
    const botao = screen.getByRole("button", { name: "2 fontes na web" });

    fireEvent.click(botao);
    fireEvent.keyDown(botao, { key: "Escape" });

    expect(botao).toHaveAttribute("aria-expanded", "false");
  });

  it("expõe o card como região nomeada pelo título", () => {
    render(<FontesPopover fontes={fontes} />);

    expect(screen.getByRole("region", { name: "Fontes na web" })).toBeInTheDocument();
  });
});
