import { MarkdownMessage } from "@/components/chat_components/markdown_message";
import type { TemaComModulos } from "@/hooks/use_materia_leitura";
import type { Materia, ModuloDetalhe } from "@/lib/materias";

interface MateriaReaderProps {
  materia: Materia;
  temas: TemaComModulos[];
  moduloSelecionadoId: string | null;
  onSelecionarModulo: (moduloId: string) => void;
  moduloDetalhe: ModuloDetalhe | null;
  carregandoModulo: boolean;
}

export function MateriaReader({
  materia,
  temas,
  moduloSelecionadoId,
  onSelecionarModulo,
  moduloDetalhe,
  carregandoModulo,
}: MateriaReaderProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-5">
      <div className="lg:hidden">
        <select
          value={moduloSelecionadoId ?? ""}
          onChange={(e) => onSelecionarModulo(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px]"
        >
          {temas.flatMap((tema) =>
            tema.modulos.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {tema.titulo} — {modulo.titulo}
              </option>
            ))
          )}
        </select>
      </div>

      <aside className="hidden w-64 shrink-0 overflow-y-auto rounded-[14px] border border-line bg-white p-4 lg:block">
        <h2 className="mb-3 font-display text-[13px] font-semibold text-charcoal">{materia.nome}</h2>
        <nav className="grid gap-4">
          {temas.map((tema) => (
            <div key={tema.id}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray">{tema.titulo}</p>
              <div className="grid gap-1">
                {tema.modulos.length === 0 && <p className="text-[11.5px] text-gray">Gerando módulos...</p>}
                {tema.modulos.map((modulo) => {
                  const ativo = modulo.id === moduloSelecionadoId;
                  return (
                    <button
                      key={modulo.id}
                      type="button"
                      onClick={() => onSelecionarModulo(modulo.id)}
                      className={`truncate rounded-[8px] px-2.5 py-2 text-left text-[12.5px] transition ${
                        ativo ? "bg-orange/10 font-medium text-orange" : "text-charcoal hover:bg-surface"
                      }`}
                    >
                      {modulo.titulo}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <section className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-[14px] border border-line bg-white p-6 sm:p-8">
        {carregandoModulo && <p className="text-[13px] text-gray">Carregando conteúdo...</p>}

        {!carregandoModulo && moduloDetalhe && (
          <article className="mx-auto max-w-[680px]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-orange">{materia.nome}</p>
            <h1 className="mt-1 font-display text-[22px] font-bold text-charcoal">{moduloDetalhe.titulo}</h1>
            <div className="mt-5">
              <MarkdownMessage content={moduloDetalhe.conteudo} />
            </div>
          </article>
        )}

        {!carregandoModulo && !moduloDetalhe && (
          <p className="text-[13px] text-gray">Selecione um módulo para começar a ler.</p>
        )}
      </section>
    </div>
  );
}