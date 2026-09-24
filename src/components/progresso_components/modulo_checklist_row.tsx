import { CheckCircle2, Circle, Lock } from "lucide-react";
import type { ModuloProgresso } from "@/lib/progresso";

interface ModuloChecklistRowProps {
  modulo: ModuloProgresso;
  onAbrir?: () => void;
}

export function ModuloChecklistRow({ modulo, onAbrir }: ModuloChecklistRowProps) {
  const Icon = modulo.estado === "concluido" ? CheckCircle2 : modulo.estado === "bloqueado" ? Lock : Circle;
  const corIcone =
    modulo.estado === "concluido" ? "text-green-600" : modulo.estado === "bloqueado" ? "text-gray" : "text-orange";
  const clicavel = modulo.estado !== "bloqueado" && !!onAbrir;

  const conteudo = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <Icon size={15} className={`shrink-0 ${corIcone}`} />
        <span className="truncate text-[12.5px] text-charcoal">{modulo.titulo}</span>
      </div>
      <span className="shrink-0 text-[11px] text-gray">
        {modulo.melhor_pontuacao}% · {modulo.tentativas_count} {modulo.tentativas_count === 1 ? "tentativa" : "tentativas"}
      </span>
    </>
  );

  if (clicavel) {
    return (
      <button
        type="button"
        onClick={onAbrir}
        className="flex w-full items-center justify-between gap-3 rounded-[8px] border border-line bg-surface px-3 py-2 text-left transition hover:border-orange/40 hover:bg-orange/5"
      >
        {conteudo}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-line bg-surface px-3 py-2">
      {conteudo}
    </div>
  );
}