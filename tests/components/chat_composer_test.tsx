// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChatComposer } from "@/components/chat_components/chat_composer";

const campo = () => screen.getByPlaceholderText("Escreva sua mensagem...");
const enviar = () => screen.getByRole("button", { name: "Enviar mensagem" });

describe("ChatComposer (campo de mensagem do chat)", () => {
  it("envia o texto digitado e limpa o campo", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);

    fireEvent.change(campo(), { target: { value: "O que é uma PA?" } });
    fireEvent.click(enviar());

    expect(onSend).toHaveBeenCalledWith("O que é uma PA?");
    expect(campo()).toHaveValue("");
  });

  it("envia ao apertar Enter (submit do formulário)", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);

    fireEvent.change(campo(), { target: { value: "Oi" } });
    fireEvent.submit(campo().closest("form")!);

    expect(onSend).toHaveBeenCalledWith("Oi");
  });

  it("desabilitado: campo e botão travados e nada é enviado", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} disabled />);

    expect(campo()).toBeDisabled();
    expect(enviar()).toBeDisabled();

    fireEvent.submit(campo().closest("form")!);
    expect(onSend).not.toHaveBeenCalled();
  });
});
