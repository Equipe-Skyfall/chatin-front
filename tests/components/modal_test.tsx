// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Modal } from "@/components/ui_components/modal";

function montar(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn();
  render(
    <Modal open title="Criar trilha" onClose={onClose} {...props}>
      <input aria-label="Nome" />
    </Modal>
  );
  return onClose;
}

describe("Modal", () => {
  it("não renderiza fechado", () => {
    montar({ open: false });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("expõe o diálogo nomeado pelo título", () => {
    montar();

    const dialogo = screen.getByRole("dialog", { name: "Criar trilha" });
    expect(dialogo.getAttribute("aria-modal")).toBe("true");
  });

  it("fecha com Esc, com o X e clicando no fundo, mas não ao clicar dentro", () => {
    const onClose = montar();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("leva o foco para dentro ao abrir e devolve ao elemento de origem ao fechar", () => {
    const origem = document.createElement("button");
    document.body.appendChild(origem);
    origem.focus();

    const { rerender } = render(
      <Modal open title="T" onClose={() => {}}>
        <input aria-label="Nome" />
      </Modal>
    );
    expect(document.activeElement).not.toBe(origem);
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);

    rerender(
      <Modal open={false} title="T" onClose={() => {}}>
        <input aria-label="Nome" />
      </Modal>
    );
    expect(document.activeElement).toBe(origem);
    origem.remove();
  });

  it("trava a rolagem da página enquanto aberto e a restaura depois", () => {
    document.body.style.overflow = "auto";
    const { rerender } = render(
      <Modal open title="T" onClose={() => {}}>
        x
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal open={false} title="T" onClose={() => {}}>
        x
      </Modal>
    );
    expect(document.body.style.overflow).toBe("auto");
  });

  it("mantém o Tab dentro do painel", () => {
    montar({ footer: <button type="button">Salvar</button> });
    const salvar = screen.getByRole("button", { name: "Salvar" });
    salvar.focus();

    fireEvent.keyDown(document, { key: "Tab" });

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fechar" }));
  });
});
