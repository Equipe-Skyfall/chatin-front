import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// next/link e next/image dependem do runtime do Next (router, otimizador de
// imagem). Nos testes basta renderizá-los como os elementos HTML equivalentes.
vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children?: unknown }) =>
      createElement("a", { href, ...props }, children as never),
  };
});

vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ src, alt, className }: { src: string; alt: string; className?: string }) =>
      createElement("img", { src, alt, className }),
  };
});

afterEach(() => {
  cleanup();
});
