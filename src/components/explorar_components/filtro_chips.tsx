interface FiltroChipsProps<T extends string> {
  rotulo: string;
  opcoes: { valor: T; label: string }[];
  valor: T;
  onChange: (valor: T) => void;
}

export function FiltroChips<T extends string>({ rotulo, opcoes, valor, onChange }: FiltroChipsProps<T>) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-wrap items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray">{rotulo}</span>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(opcao.valor)}
            className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-orange/20 focus-visible:outline-none ${
              ativo
                ? "border-orange bg-orange/15 text-orange"
                : "border-line bg-surface text-gray hover:border-orange/40 hover:text-charcoal"
            }`}
          >
            {opcao.label}
          </button>
        );
      })}
    </div>
  );
}
