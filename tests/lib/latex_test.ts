import { describe, expect, it } from "vitest";
import { normalizeMathDelimiters } from "@/lib/latex";

describe("normalizeMathDelimiters (fórmulas nas mensagens do chat)", () => {
  it("converte \\( ... \\) em matemática inline $...$", () => {
    expect(normalizeMathDelimiters("A área é \\( \\pi r^2 \\).")).toBe("A área é $\\pi r^2$.");
  });

  it("converte \\[ ... \\] em bloco $$...$$ em linhas próprias", () => {
    expect(normalizeMathDelimiters("Veja: \\[ x = 1 \\]")).toBe("Veja: \n$$\nx = 1\n$$\n");
  });

  it("converte blocos que ocupam várias linhas", () => {
    const entrada = "\\[\na + b\n= c\n\\]";
    expect(normalizeMathDelimiters(entrada)).toBe("\n$$\na + b\n= c\n$$\n");
  });

  it("converte várias fórmulas na mesma mensagem", () => {
    expect(normalizeMathDelimiters("\\(a\\) e \\(b\\)")).toBe("$a$ e $b$");
  });

  it("não altera fórmulas dentro de código inline", () => {
    const entrada = "Use `\\(x\\)` para inline e \\(y\\) aqui.";
    expect(normalizeMathDelimiters(entrada)).toBe("Use `\\(x\\)` para inline e $y$ aqui.");
  });

  it("não altera fórmulas dentro de blocos de código cercados", () => {
    const entrada = "```latex\n\\[ x \\]\n```\ndepois \\(z\\)";
    expect(normalizeMathDelimiters(entrada)).toBe("```latex\n\\[ x \\]\n```\ndepois $z$");
  });

  it("não altera blocos com ~~~", () => {
    const entrada = "~~~\n\\(x\\)\n~~~";
    expect(normalizeMathDelimiters(entrada)).toBe(entrada);
  });

  it("trata bloco de código não fechado (streaming) como código até o fim", () => {
    const entrada = "texto \\(a\\)\n```\n\\(b\\)";
    expect(normalizeMathDelimiters(entrada)).toBe("texto $a$\n```\n\\(b\\)");
  });

  it("mantém intacto texto sem delimitadores", () => {
    const entrada = "Olá! Custa $5 e $10.";
    expect(normalizeMathDelimiters(entrada)).toBe(entrada);
  });
});
