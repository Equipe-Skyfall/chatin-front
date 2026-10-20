// Progresso de leitura por matéria, guardado no navegador do aluno.
//
// O backend só conhece o `estado` do módulo (bloqueado/disponivel/concluido),
// que é resultado do quiz - ele não registra a *leitura* em si (quais módulos o
// aluno abriu e terminou de ler, nem onde parou). Enquanto não existir um
// endpoint de progresso de leitura no chatin-back, esse acompanhamento vive aqui,
// persistido em `localStorage` para sobreviver ao retorno à matéria.

const CHAVE_STORAGE = "chatin:progresso-leitura";

export interface ProgressoLeituraMateria {
  materiaId: string;
  /** Módulos abertos pelo aluno, na ordem em que foram acessados. */
  acessados: string[];
  /** Módulos cuja leitura foi concluída pelo aluno. */
  concluidos: string[];
  /** Último módulo aberto - ponto de retomada ao voltar à matéria. */
  ultimoModuloId: string | null;
  atualizadoEm: string;
}

export type ProgressoLeitura = Record<string, ProgressoLeituraMateria>;

function storageDisponivel(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Estado salvo por completo; tolera JSON corrompido devolvendo vazio. */
export function lerProgressoLeitura(): ProgressoLeitura {
  if (!storageDisponivel()) return {};

  try {
    const bruto = window.localStorage.getItem(CHAVE_STORAGE);
    if (!bruto) return {};

    const dados: unknown = JSON.parse(bruto);
    return dados && typeof dados === "object" ? (dados as ProgressoLeitura) : {};
  } catch {
    return {};
  }
}

function salvarProgresso(estado: ProgressoLeitura): void {
  if (!storageDisponivel()) return;

  try {
    window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
  } catch {
    // Storage cheio/indisponível (modo privado): a leitura segue, só não persiste.
  }
}

export function progressoDaMateria(materiaId: string): ProgressoLeituraMateria | null {
  return lerProgressoLeitura()[materiaId] ?? null;
}

function vazio(materiaId: string): ProgressoLeituraMateria {
  return { materiaId, acessados: [], concluidos: [], ultimoModuloId: null, atualizadoEm: "" };
}

function semDuplicar(lista: string[], id: string): string[] {
  return lista.includes(id) ? lista : [...lista, id];
}

function atualizar(
  materiaId: string,
  mutacao: (progresso: ProgressoLeituraMateria) => ProgressoLeituraMateria
): ProgressoLeituraMateria {
  const estado = lerProgressoLeitura();
  const atual = estado[materiaId] ?? vazio(materiaId);
  const proximo = { ...mutacao(atual), atualizadoEm: new Date().toISOString() };

  salvarProgresso({ ...estado, [materiaId]: proximo });
  return proximo;
}

/** Registra que o aluno abriu o módulo (acesso). */
export function registrarModuloAcessado(materiaId: string, moduloId: string): ProgressoLeituraMateria {
  return atualizar(materiaId, (progresso) => ({
    ...progresso,
    acessados: semDuplicar(progresso.acessados, moduloId),
    ultimoModuloId: moduloId,
  }));
}

/** Registra que o aluno concluiu a leitura do módulo. */
export function registrarModuloConcluido(materiaId: string, moduloId: string): ProgressoLeituraMateria {
  return atualizar(materiaId, (progresso) => ({
    ...progresso,
    acessados: semDuplicar(progresso.acessados, moduloId),
    concluidos: semDuplicar(progresso.concluidos, moduloId),
    ultimoModuloId: moduloId,
  }));
}

/**
 * Desfaz a conclusão de leitura do módulo. Mantém o acesso registrado (o aluno
 * continua contando como quem passou por ele) e o ponto de retomada.
 */
export function desmarcarModuloConcluido(materiaId: string, moduloId: string): ProgressoLeituraMateria {
  return atualizar(materiaId, (progresso) => ({
    ...progresso,
    concluidos: progresso.concluidos.filter((id) => id !== moduloId),
  }));
}

export function limparProgressoLeitura(): void {
  if (!storageDisponivel()) return;

  try {
    window.localStorage.removeItem(CHAVE_STORAGE);
  } catch {
    // Sem storage não há o que limpar.
  }
}

/** Quantos dos módulos informados já foram lidos. */
export function contarLidos(progresso: ProgressoLeituraMateria | null, modulos: string[]): number {
  if (!progresso) return 0;

  const lidos = new Set(progresso.concluidos);
  return modulos.filter((id) => lidos.has(id)).length;
}

/**
 * Módulo a retomar ao voltar à matéria: o último acessado, desde que ainda
 * esteja acessível e a leitura não tenha sido concluída. Devolve null quando não
 * há ponto de retomada - nesse caso a seleção normal (primeiro não concluído) decide.
 */
export function moduloParaRetomar(progresso: ProgressoLeituraMateria | null, ordem: string[]): string | null {
  const ultimo = progresso?.ultimoModuloId;
  if (!ultimo || !ordem.includes(ultimo)) return null;
  if (progresso?.concluidos.includes(ultimo)) return null;

  return ultimo;
}

/**
 * Recomendação de leitura exposta para o sistema de recomendação: retoma de onde
 * parou; senão, aponta o primeiro módulo ainda não lido; senão, o primeiro da ordem.
 */
export function recomendarModulo(progresso: ProgressoLeituraMateria | null, ordem: string[]): string | null {
  if (ordem.length === 0) return null;

  return (
    moduloParaRetomar(progresso, ordem) ??
    ordem.find((id) => !progresso?.concluidos.includes(id)) ??
    ordem[0]
  );
}
