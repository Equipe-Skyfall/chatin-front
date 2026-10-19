// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComecarLicaoButton } from "@/components/chat_components/comecar_licao_button";

describe("ComecarLicaoButton", () => {
  it("é um pill laranja que chama onComecar", () => {
    const onComecar = vi.fn();
    render(<ComecarLicaoButton onComecar={onComecar} />);

    const botao = screen.getByRole("button", { name: "Começar lição" });
    expect(botao.className).toContain("rounded-full");
    expect(botao.className).toContain("bg-orange");

    fireEvent.click(botao);
    expect(onComecar).toHaveBeenCalledTimes(1);
  });

  it("enquanto a lição é gerada mostra o progresso e desabilita o botão", () => {
    render(<ComecarLicaoButton onComecar={vi.fn()} carregando />);

    const botao = screen.getByRole("button", { name: "Preparando a lição..." });
    expect(botao).toBeDisabled();
  });
});
