// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacySection } from "@/components/profile_components/privacy_section";
import { CONTATO_EMAIL } from "@/lib/lgpd";

describe("PrivacySection (aba Privacidade do perfil)", () => {
  it("lista os direitos do titular e o e-mail do encarregado", () => {
    render(<PrivacySection />);

    expect(screen.getByRole("heading", { name: "Seus direitos (LGPD)" })).toBeTruthy();
    expect(screen.getByText(/art\. 18/)).toBeTruthy();
    expect(screen.getByText(/Revogação do consentimento/)).toBeTruthy();
    expect(screen.getByRole("link", { name: CONTATO_EMAIL })).toHaveAttribute("href", `mailto:${CONTATO_EMAIL}`);
    expect(screen.getByRole("link", { name: /Política de Privacidade completa/ })).toHaveAttribute(
      "href",
      "/privacidade"
    );
  });
});
