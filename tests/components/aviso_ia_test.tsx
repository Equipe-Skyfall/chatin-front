// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { AvisoIa } from "@/components/layout_components/aviso_ia";
import { MENSAGEM_IA_INDISPONIVEL } from "@/lib/errorMessages";
import { marcarIaDisponivel, marcarIaIndisponivel } from "@/hooks/use_ia_status";

beforeEach(() => {
  marcarIaDisponivel();
});

describe("AvisoIa", () => {
  it("não renderiza nada enquanto a IA está disponível", () => {
    render(<AvisoIa />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("informa a indisponibilidade com a orientação de tentar depois", () => {
    act(() => marcarIaIndisponivel());

    render(<AvisoIa />);

    expect(screen.getByRole("status")).toHaveTextContent(MENSAGEM_IA_INDISPONIVEL);
  });

  it("pode ser fechado sem bloquear a tela", () => {
    act(() => marcarIaIndisponivel());
    render(<AvisoIa />);

    fireEvent.click(screen.getByRole("button", { name: /fechar aviso/i }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
