// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacySection } from "@/components/profile_components/privacy_section";
import { CONTATO_URL } from "@/lib/lgpd";

describe("PrivacySection (aba Privacidade do perfil)", () => {
  it("lista os direitos do titular e o canal de contato", () => {
    render(<PrivacySection />);

    expect(screen.getByRole("heading", { name: "Seus direitos (LGPD)" })).toBeTruthy();
    expect(screen.getByText(/art\. 18/)).toBeTruthy();
    expect(screen.getByText(/Revogar o consentimento/)).toBeTruthy();
    expect(screen.getByRole("link", { name: CONTATO_URL })).toHaveAttribute("href", CONTATO_URL);
    expect(screen.getByRole("link", { name: /Política de Privacidade completa/ })).toHaveAttribute(
      "href",
      "/privacidade"
    );
  });
});
