// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Materia, ModuloDetalhe } from "@/lib/materias";
import type { EstadosPorId, TemaComModulos } from "@/hooks/use_materia_leitura";

vi.mock("@/components/materias_components/apostilas_markdown", () => ({
  ApostilaMarkdown: ({ content }: { content: string }) => <div data-testid="apostila-markdown">{content}</div>,
}));

vi.mock("@/components/materias_components/tema_trilha_item", () => ({
  TemaTrilhaItem: ({
    tema,
    onSelecionarModulo,
  }: {
    tema: TemaComModulos;
    onSelecionarModulo: (moduloId: string) => void;
  }) => (
    <div>
      <p>{tema.titulo}</p>
      {tema.modulos.map((modulo) => (
        <button key={modulo.id} type="button" onClick={() => onSelecionarModulo(modulo.id)}>
          {modulo.titulo}
        </button>
      ))}
    </div>
  ),
}));

import { MateriaReader } from "@/components/materias_components/materia_reader";

const materia: Materia = {
  id: "mat1",
  nome: "História",
  descricao: "Revoluções",
  owner_user_id: "u1",
  votos: 3,
  created_at: "2026-01-01T00:00:00Z",
};

const temas: TemaComModulos[] = [
  {
    id: "t1",
    materia_id: "mat1",
    titulo: "Fundamentos",
    descricao: "",
    ordem: 1,
    status: "pronto",
    direcionamento: "",
    created_at: "",
    modulos: [
      { id: "m1", tema_id: "t1", titulo: "Origem", descricao: "", ordem: 1, status: "pronto", created_at: "" },
      { id: "m2", tema_id: "t1", titulo: "Causas", descricao: "", ordem: 2, status: "pronto", created_at: "" },
    ],
  },
  {
    id: "t2",
    materia_id: "mat1",
    titulo: "Avançado",
    descricao: "",
    ordem: 2,
    status: "pronto",
    direcionamento: "",
    created_at: "",
    modulos: [
      { id: "m3", tema_id: "t2", titulo: "Desfecho", descricao: "", ordem: 1, status: "bloqueado", created_at: "" },
    ],
  },
];

const estadosTemas: EstadosPorId = { t1: "disponivel", t2: "bloqueado" };
const estadosModulos: EstadosPorId = { m1: "concluido", m2: "disponivel", m3: "bloqueado" };

function detalhe(id: string, titulo: string): ModuloDetalhe {
  return {
    id,
    titulo,
    descricao: "Uma breve introdução.",
    estado: "disponivel",
    conteudo: `Corpo de ${titulo}. ` + "palavra ".repeat(400).trim(),
  };
}

function montar(overrides: Partial<Parameters<typeof MateriaReader>[0]> = {}) {
  const props = {
    materia,
    temas,
    estadosModulos,
    estadosTemas,
    moduloSelecionadoId: "m2",
    onSelecionarModulo: vi.fn(),
    moduloDetalhe: detalhe("m2", "Causas"),
    carregandoModulo: false,
    moduloBloqueado: false,
    modulosLidos: [] as string[],
    onMarcarLido: vi.fn(),
    onDesmarcarLido: vi.fn(),
    erroModulo: false,
    onTentarNovamente: vi.fn(),
    ...overrides,
  };
  render(<MateriaReader {...props} />);
  return props;
}

describe("MateriaReader - apresentação do conteúdo", () => {
  it("mostra o título, a descrição e o conteúdo do módulo selecionado", () => {
    montar();

    expect(screen.getByRole("heading", { name: "Causas" })).toBeTruthy();
    expect(screen.getByText("Uma breve introdução.")).toBeTruthy();
    expect(screen.getByTestId("apostila-markdown").textContent).toContain("Corpo de Causas.");
  });

  it("identifica o capítulo e a posição do módulo", () => {
    montar();

    expect(screen.getByText("Capítulo 1 · Fundamentos")).toBeTruthy();
    expect(screen.getByText("Módulo 2 de 2")).toBeTruthy();
  });

  it("exibe o tempo estimado de leitura", () => {
    montar();

    expect(screen.getByText(/2 min de leitura/)).toBeTruthy();
  });

  it("organiza o sumário com os capítulos e seus módulos", () => {
    montar();

    // O sumário aparece duas vezes no DOM (versão mobile em <details> e versão
    // desktop no <aside>), por isso as buscas usam os variantes *AllBy*.
    expect(screen.getAllByText("Fundamentos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Avançado").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Origem" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Desfecho" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 de 3 módulos concluídos").length).toBeGreaterThan(0);
  });
});

describe("MateriaReader - navegação entre tópicos", () => {
  it("leva ao módulo anterior pelo botão Anterior", () => {
    const props = montar();

    fireEvent.click(screen.getByRole("button", { name: /Anterior/ }));

    expect(props.onSelecionarModulo).toHaveBeenCalledWith("m1");
  });

  it("leva ao próximo módulo pelo botão Próximo", () => {
    const props = montar({ moduloSelecionadoId: "m1", moduloDetalhe: detalhe("m1", "Origem") });

    fireEvent.click(screen.getByRole("button", { name: /Próximo/ }));

    expect(props.onSelecionarModulo).toHaveBeenCalledWith("m2");
  });

  it("não oferece Próximo quando o último módulo liberado já está aberto", () => {
    montar();

    // t2 está bloqueado, então m2 é o último da sequência navegável.
    expect(screen.queryByRole("button", { name: /Próximo/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeTruthy();
  });

  it("permite trocar de módulo pelo sumário", () => {
    const props = montar();

    fireEvent.click(screen.getAllByRole("button", { name: "Origem" })[0]);

    expect(props.onSelecionarModulo).toHaveBeenCalledWith("m1");
  });
});

describe("MateriaReader - estados da leitura", () => {
  it("mostra aviso de carregamento enquanto busca o conteúdo", () => {
    montar({ moduloDetalhe: null, carregandoModulo: true });

    expect(screen.getByText("Carregando conteúdo...")).toBeTruthy();
  });

  it("mostra o estado bloqueado com atalho para os questionários", () => {
    montar({ moduloBloqueado: true, moduloDetalhe: null });

    expect(screen.getByText("Conteúdo bloqueado")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ir para os questionários" }).getAttribute("href")).toBe("/quiz");
  });

  it("convida a selecionar um módulo quando nenhum está aberto", () => {
    montar({ moduloSelecionadoId: null, moduloDetalhe: null });

    expect(screen.getByText("Selecione um módulo para começar a ler.")).toBeTruthy();
  });

  it("oferece o quiz do módulo pelo botão Fazer o quiz", () => {
    montar();

    expect(screen.getByRole("link", { name: /Fazer o quiz/ }).getAttribute("href")).toBe("/quiz?highlight=m2");
  });

  it("mostra estado de erro com Tentar novamente quando o conteúdo falha", () => {
    const props = montar({ erroModulo: true, moduloDetalhe: null });

    expect(screen.getByText("Não foi possível carregar este conteúdo")).toBeTruthy();
    // Nem o estado vazio nem o conteúdo aparecem quando há erro.
    expect(screen.queryByText("Selecione um módulo para começar a ler.")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    expect(props.onTentarNovamente).toHaveBeenCalledTimes(1);
  });
});

describe("MateriaReader - progresso de leitura", () => {
  it("apresenta quantos módulos já foram lidos", () => {
    montar({ modulosLidos: ["m1"] });

    // O sumário é renderizado duas vezes (mobile e desktop).
    expect(screen.getAllByText("1 de 3 módulos lidos").length).toBeGreaterThan(0);
  });

  it("começa com nenhum módulo lido", () => {
    montar();

    expect(screen.getAllByText("0 de 3 módulos lidos").length).toBeGreaterThan(0);
  });

  it("marca o módulo atual como lido pelo botão", () => {
    const props = montar();

    fireEvent.click(screen.getByRole("button", { name: /Marcar como lido/ }));

    expect(props.onMarcarLido).toHaveBeenCalledWith("m2");
  });

  it("no módulo já lido, o mesmo botão vira 'Desmarcar como lido' e desmarca", () => {
    const props = montar({ modulosLidos: ["m2"] });

    // Mesmo botão, só muda a ação: não há mais "Marcar como lido".
    expect(screen.queryByRole("button", { name: /Marcar como lido/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Desmarcar como lido/ }));

    expect(props.onDesmarcarLido).toHaveBeenCalledWith("m2");
  });
});
