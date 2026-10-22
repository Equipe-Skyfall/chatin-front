import type { CotaTrilhas } from "@/interfaces/trilha_interfaces";

function dataDeRenovacao(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** "2 de 3 trilhas criadas este mês" com uma barra fina; admin não tem limite. */
export function CotaTrilhasInfo({ cota }: { cota: CotaTrilhas | null }) {
  if (!cota || cota.limite === null) return null;

  const percentual = Math.min(100, Math.round((cota.usadas / cota.limite) * 100));
  const esgotada = cota.restantes === 0;

  return (
    <div className="grid gap-1.5">
      <p className="text-[11.5px] text-gray">
        {cota.usadas} de {cota.limite} trilhas criadas este mês
        {esgotada && ` · renova em ${dataDeRenovacao(cota.reseta_em)}`}
      </p>
      <div
        role="progressbar"
        aria-label="Trilhas criadas este mês"
        aria-valuenow={cota.usadas}
        aria-valuemin={0}
        aria-valuemax={cota.limite}
        className="h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-orange transition-[width]" style={{ width: `${percentual}%` }} />
      </div>
    </div>
  );
}
