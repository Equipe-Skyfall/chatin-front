// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api";
import type { Materia, ModuloResumo, Tema } from "@/lib/materias";

const mocks = vi.hoisted(() => ({
  obterMateria: vi.fn(),
  listarTemas: vi.fn(),
  listarModulos: vi.fn(),
  obterModulo: vi.fn(),
  obterTrilha: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/materias", () => ({
  obterMateria: mocks.obterMateria,
  listarTemas: mocks.listarTemas,
  listarModulos: mocks.listarModulos,
  obterModulo: mocks.obterModulo,
}));
vi.mock("@/lib/chat", () => ({ obterTrilha: mocks.obterTrilha }));
vi.mock("@/lib/errorMessages", () => ({ getFriendlyErrorMessage: () => "mensagem amigável" }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));

import { useMateriaLeitura } from "@/hooks/use_materia_leitura";
import { progressoDaMateria, registrarModuloAcessado } from "@/lib/leitura_progresso";

const materia: Materia = {
  id: "mat1",
  nome: "História",
  descricao: "Revoluções",
  owner_user_id: "u1",
  votos: 3,
  created_at: "2026-01-01T00:00:00Z",
};

const temas: Tema[] = [
  { id: "t1", materia_id: "mat1", titulo: "Fundamentos", descricao: "", ordem: 1, status: "pronto", direcionamento: "", created_at: "" },
  { id: "t2", materia_id: "mat1", titulo: "Avançado", descricao: "", ordem: 2, status: "pronto", direcionamento: "", created_at: "" },
];

const modulos: Record<string, ModuloResumo[]> = {
  t1: [
    { id: "m1", tema_id: "t1", titulo: "Origem", descricao: "", ordem: 1, status: "pronto", created_at: "" },
    { id: "m2", tema_id: "t1", titulo: "Causas", descricao: "", ordem: 2, status: "pronto", created_at: "" },
  ],
  t2: [{ id: "m3", tema_id: "t2", titulo: "Desfecho", descricao: "", ordem: 1, status: "pronto", created_at: "" }],
};

// t1 liberado, t2 bloqueado: m1 concluído, m2 disponível, m3 bloqueado.
const trilha = {
  materias: [
    {
      id: "mat1",
      nome: "História",
      temas: [
        {
          id: "t1",
          titulo: "Fundamentos",
          ordem: 1,
          estado: "disponivel",
          modulos: [
            { id: "m1", titulo: "Origem", ordem: 1, estado: "concluido" },
            { id: "m2", titulo: "Causas", ordem: 2, estado: "disponivel" },
          ],
        },
        {
          id: "t2",
          titulo: "Avançado",
          ordem: 2,
          estado: "bloqueado",
          modulos: [{ id: "m3", titulo: "Desfecho", ordem: 1, estado: "bloqueado" }],
        },
      ],
    },
  ],
};

function detalhe(id: string) {
  return { id, titulo: `Título ${id}`, descricao: "", estado: "disponivel", conteudo: `Conteúdo ${id}` };
}

beforeEach(() => {
  localStorage.clear();
  mocks.obterMateria.mockReset().mockResolvedValue(materia);
  mocks.listarTemas.mockReset().mockResolvedValue(temas);
  mocks.listarModulos.mockReset().mockImplementation(async (temaId: string) => modulos[temaId] ?? []);
  mocks.obterModulo.mockReset().mockImplementation(async (id: string) => detalhe(id));
  mocks.obterTrilha.mockReset().mockResolvedValue(trilha);
  mocks.toastError.mockReset();
});

async function montar(moduloInicialId: string | null = null) {
  const hook = renderHook(() => useMateriaLeitura("mat1", moduloInicialId));
  await waitFor(() => expect(hook.result.current.carregando).toBe(false));
  return hook;
}

describe("useMateriaLeitura - acesso e seleção inicial", () => {
  it("carrega matéria, temas e módulos e abre no primeiro módulo não concluído", async () => {
    const { result } = await montar();

    expect(result.current.materia).toEqual(materia);
    expect(result.current.temas.map((t) => t.titulo)).toEqual(["Fundamentos", "Avançado"]);
    expect(result.current.temas[0].modulos.map((m) => m.id)).toEqual(["m1", "m2"]);
    // m1 está concluído, então a leitura começa em m2.
    expect(result.current.moduloSelecionadoId).toBe("m2");
  });

  it("respeita o módulo pedido na URL quando ele está acessível", async () => {
    const { result } = await montar("m1");

    expect(result.current.moduloSelecionadoId).toBe("m1");
  });

  it("ignora o módulo pedido se ele estiver num tópico bloqueado", async () => {
    const { result } = await montar("m3");

    expect(result.current.moduloSelecionadoId).toBe("m2");
  });

  it("carrega o conteúdo do módulo selecionado", async () => {
    const { result } = await montar();

    await waitFor(() => expect(result.current.moduloDetalhe?.id).toBe("m2"));
    expect(mocks.obterModulo).toHaveBeenCalledWith("m2");
    expect(result.current.moduloBloqueado).toBe(false);
  });
});

describe("useMateriaLeitura - navegação entre tópicos", () => {
  it("troca de módulo ao selecionar um acessível", async () => {
    const { result } = await montar();

    await waitFor(() => expect(result.current.moduloDetalhe?.id).toBe("m2"));

    act(() => {
      result.current.selecionarModulo("m1");
    });

    expect(result.current.moduloSelecionadoId).toBe("m1");
    await waitFor(() => expect(result.current.moduloDetalhe?.id).toBe("m1"));
  });

  it("não navega para um módulo de tópico bloqueado", async () => {
    const { result } = await montar();

    act(() => {
      result.current.selecionarModulo("m3");
    });

    expect(result.current.moduloSelecionadoId).toBe("m2");
    expect(mocks.obterModulo).not.toHaveBeenCalledWith("m3");
  });
});

describe("useMateriaLeitura - módulo recusado pelo backend", () => {
  it("marca como bloqueado quando o backend nega o conteúdo (403)", async () => {
    mocks.obterModulo.mockRejectedValue(new ApiError("Conteúdo bloqueado", 403));

    const { result } = await montar();

    await waitFor(() => expect(result.current.moduloBloqueado).toBe(true));
    expect(result.current.carregandoModulo).toBe(false);
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("sinaliza erro no conteúdo (sem bloquear) para falhas genéricas", async () => {
    mocks.obterModulo.mockRejectedValue(new ApiError("Boom", 500));

    const { result } = await montar();

    await waitFor(() => expect(result.current.erroModulo).toBe(true));
    expect(result.current.moduloBloqueado).toBe(false);
    expect(result.current.moduloDetalhe).toBeNull();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("recarregarModulo busca o conteúdo de novo e limpa o erro", async () => {
    mocks.obterModulo.mockRejectedValue(new ApiError("Boom", 500));
    const { result } = await montar();
    await waitFor(() => expect(result.current.erroModulo).toBe(true));

    mocks.obterModulo.mockResolvedValue(detalhe("m2"));

    act(() => {
      result.current.recarregarModulo();
    });

    await waitFor(() => expect(result.current.moduloDetalhe?.id).toBe("m2"));
    expect(result.current.erroModulo).toBe(false);
  });
});

describe("useMateriaLeitura - falha ao carregar a apostila", () => {
  it("sinaliza erro quando a matéria não carrega", async () => {
    mocks.obterMateria.mockRejectedValue(new ApiError("Boom", 500));

    const { result } = await montar();

    expect(result.current.erro).toBe(true);
    expect(result.current.carregando).toBe(false);
    expect(mocks.toastError).toHaveBeenCalledWith("mensagem amigável");
  });

  it("segue sem estados de trilha quando a trilha falha", async () => {
    mocks.obterTrilha.mockRejectedValue(new ApiError("Boom", 500));

    const { result } = await montar();

    // Sem trilha, nada é bloqueado por conta própria e o módulo disponível continua acessível.
    expect(result.current.moduloSelecionadoId).toBe("m1");
    expect(result.current.moduloBloqueado).toBe(false);
  });
});

describe("useMateriaLeitura - progresso de leitura", () => {
  it("registra o módulo aberto como acessado", async () => {
    const { result } = await montar();

    await waitFor(() => expect(result.current.moduloSelecionadoId).toBe("m2"));
    expect(progressoDaMateria("mat1")?.acessados).toContain("m2");
  });

  it("retoma de onde parou (último acessado ainda não lido)", async () => {
    registrarModuloAcessado("mat1", "m1");

    const { result } = await montar();

    // m1 é o último acessado e ainda não foi lido, então reabre nele - mesmo já
    // estando "concluído" no quiz.
    expect(result.current.moduloSelecionadoId).toBe("m1");
  });

  it("registra o acesso ao trocar de módulo", async () => {
    const { result } = await montar();
    await waitFor(() => expect(result.current.moduloDetalhe?.id).toBe("m2"));

    act(() => {
      result.current.selecionarModulo("m1");
    });

    const progresso = progressoDaMateria("mat1");
    expect(progresso?.acessados).toEqual(expect.arrayContaining(["m2", "m1"]));
    expect(progresso?.ultimoModuloId).toBe("m1");
  });

  it("marcarModuloLido expõe o módulo em modulosLidos e persiste", async () => {
    const { result } = await montar();

    act(() => {
      result.current.marcarModuloLido("m2");
    });

    expect(result.current.modulosLidos).toContain("m2");
    expect(progressoDaMateria("mat1")?.concluidos).toContain("m2");
  });

  it("desmarcarModuloLido tira o módulo de modulosLidos e persiste", async () => {
    const { result } = await montar();

    act(() => {
      result.current.marcarModuloLido("m2");
    });
    act(() => {
      result.current.desmarcarModuloLido("m2");
    });

    expect(result.current.modulosLidos).not.toContain("m2");
    expect(progressoDaMateria("mat1")?.concluidos).not.toContain("m2");
  });
});
