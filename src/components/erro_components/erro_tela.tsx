import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

interface ErroTelaProps {
  titulo: string;
  descricao: string;
  children: ReactNode;
}

/** Card centralizado das telas de erro (error / global-error / not-found). Só
 * apresentação: as ações entram como `children`. */
export function ErroTela({ titulo, descricao, children }: ErroTelaProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <section role="alert" className="w-full max-w-md rounded-lg bg-surface p-8 text-center shadow-neo-raised">
        <TriangleAlert size={32} className="mx-auto text-error-ink" aria-hidden="true" />
        <h1 className="mt-4 font-display text-[22px] font-semibold text-charcoal">{titulo}</h1>
        <p className="mt-2 text-[15px] text-gray">{descricao}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">{children}</div>
      </section>
    </main>
  );
}

export const classeBotaoPrimario =
  "rounded-md bg-orange-light px-5 py-2.5 text-[14px] font-bold text-white shadow-neo-raised-sm transition-colors hover:bg-orange focus-visible:ring-4 focus-visible:ring-orange/15 focus-visible:outline-none active:shadow-neo-inset";

export const classeBotaoSecundario =
  "rounded-md bg-surface px-5 py-2.5 text-[14px] font-bold text-orange shadow-neo-raised-sm transition-colors hover:text-orange-light focus-visible:ring-4 focus-visible:ring-orange/15 focus-visible:outline-none active:shadow-neo-inset";
