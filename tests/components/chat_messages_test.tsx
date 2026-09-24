// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessages } from "@/components/chat_components/chat_messages";
import type { ChatMessage } from "@/interfaces/chat_interfaces";

function mensagem(parcial: Partial<ChatMessage>): ChatMessage {
  return { id: crypto.randomUUID(), sender: "user", content: "", time: "12:00", user: { username: "ana" }, ...parcial };
}

describe("ChatMessages (lista de mensagens do chat)", () => {
  it("mostra o estado vazio quando não há mensagens", () => {
    render(<ChatMessages messages={[]} />);

    expect(screen.getByText("Comece uma conversa com o CHATin.")).toBeInTheDocument();
  });

  it("mostra 'Carregando conversa...' em vez do estado vazio", () => {
    render(<ChatMessages messages={[]} carregando />);

    expect(screen.getByText("Carregando conversa...")).toBeInTheDocument();
    expect(screen.queryByText("Comece uma conversa com o CHATin.")).not.toBeInTheDocument();
  });

  it("identifica autor e horário de cada mensagem", () => {
    render(
      <ChatMessages
        messages={[
          mensagem({ sender: "user", content: "Oi", time: "10:01" }),
          mensagem({ sender: "assistant", content: "Olá!", time: "10:02" }),
        ]}
      />
    );

    expect(screen.getByText("10:01 · ana")).toBeInTheDocument();
    expect(screen.getByText("10:02 · CHATin")).toBeInTheDocument();
  });

  it("marca mensagem que falhou como 'não enviada'", () => {
    render(<ChatMessages messages={[mensagem({ content: "Oi", falhou: true })]} />);

    expect(screen.getByText("12:00 · não enviada")).toBeInTheDocument();
  });

  it("mostra 'Pensando...' enquanto a IA responde", () => {
    render(<ChatMessages messages={[mensagem({ content: "Oi" })]} enviando />);

    expect(screen.getByText("Pensando...")).toBeInTheDocument();
  });

  it("renderiza markdown nas respostas do assistente", () => {
    const { container } = render(
      <ChatMessages messages={[mensagem({ sender: "assistant", content: "Isso é **importante**" })]} />
    );

    expect(container.querySelector("strong")).toHaveTextContent("importante");
  });

  it("mensagem do aluno é texto puro (markdown não é interpretado)", () => {
    const { container } = render(<ChatMessages messages={[mensagem({ content: "**não negrito**" })]} />);

    expect(screen.getByText("**não negrito**")).toBeInTheDocument();
    expect(container.querySelector("strong")).toBeNull();
  });

  it("não injeta HTML vindo da resposta da IA (XSS)", () => {
    const { container } = render(
      <ChatMessages
        messages={[mensagem({ sender: "assistant", content: 'Oi <img src=x onerror="alert(1)"><script>alert(2)</script>' })]}
      />
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img[onerror]")).toBeNull();
  });

  it("neutraliza links javascript: e abre links externos em nova aba", () => {
    render(
      <ChatMessages
        messages={[
          mensagem({
            sender: "assistant",
            content: "[mal](javascript:alert(1)) e [bom](https://enem.inep.gov.br)",
          }),
        ]}
      />
    );

    expect(screen.getByText("mal").closest("a")?.getAttribute("href") ?? "").not.toMatch(/^javascript:/i);

    const bom = screen.getByRole("link", { name: "bom" });
    expect(bom).toHaveAttribute("href", "https://enem.inep.gov.br");
    expect(bom).toHaveAttribute("target", "_blank");
    expect(bom).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });
});
