// Revisões de resumos da Biblioteca (US18).
//
// Quem conta as revisões é o chatin-back: cada `GET /resumos/{id}` registra uma
// abertura e o total vem em `GET /progresso` (`resumos_revisados`). Antes dessa
// rota existir, o front guardava a contagem no `localStorage` (chave abaixo) - ela
// era por navegador, não por conta. Fica só a limpeza desse dado antigo.
const CHAVE_STORAGE = "chatin:resumos-revisao";

function storageDisponivel(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Remove a contagem antiga de revisões guardada no navegador. */
export function limparRevisoes(): void {
  if (!storageDisponivel()) return;

  try {
    window.localStorage.removeItem(CHAVE_STORAGE);
  } catch {
    // Sem storage não há o que limpar.
  }
}
