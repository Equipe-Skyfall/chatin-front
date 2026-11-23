// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacidadePage from "@/app/privacidade/page";
import { CONTATO_EMAIL } from "@/lib/lgpd";

describe("Página /privacidade", () => {
  it("mostra a Política de Privacidade com as seções principais", () => {
    render(<PrivacidadePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Política de Privacidade" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: /Base legal/ })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: /Seus direitos/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/termos");
    const contatos = screen.getAllByRole("link", { name: CONTATO_EMAIL });
    expect(contatos.length).toBeGreaterThan(0);
    contatos.forEach((link) => expect(link).toHaveAttribute("href", `mailto:${CONTATO_EMAIL}`));
  });
});
