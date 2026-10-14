// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/layout_components/app_header";

describe("AppHeader", () => {
  it("não mostra progresso por padrão", () => {
    render(<AppHeader title="CHATin" />);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("mostra o título da matéria e o progresso nela", () => {
    render(
      <AppHeader
        title="História"
        subtitle="Queda da Bastilha"
        progresso={{ percentual: 50, concluidos: 2, total: 4 }}
      />
    );

    expect(screen.getByRole("heading", { name: "História" })).toBeInTheDocument();
    expect(screen.getByText("Queda da Bastilha")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progresso em História" })).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("2 de 4 módulos")).toBeInTheDocument();
  });
});
