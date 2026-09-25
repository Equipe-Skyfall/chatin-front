import { BookOpen, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import type { ProgressoAgregado } from "@/lib/progresso";

interface ProgressoStatsProps {
  agregado: ProgressoAgregado;
}

export function ProgressoStats({ agregado }: ProgressoStatsProps) {
  const items = [
    { label: "Matérias", value: agregado.totalMaterias, icon: BookOpen, color: "#fb7118" },
    { label: "Concluídas", value: agregado.materiasConcluidas, icon: CheckCircle2, color: "#22c55e" },
    { label: "XP Total", value: agregado.xpTotal.toLocaleString("pt-BR"), icon: Sparkles, color: "#6d5bd0" },
    { label: "Progresso Médio", value: `${agregado.percentualMedio}%`, icon: TrendingUp, color: "#3b82f6" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
className="relative overflow-hidden rounded-[14px] bg-surface p-4 shadow-neo-raised"        >
          <div
            className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full opacity-10"
            style={{ backgroundColor: color }}
          />
          <div
            className="relative flex size-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}1a` }}
          >
            <Icon size={19} style={{ color }} />
          </div>
          <p className="relative mt-3 font-display text-2xl font-bold text-charcoal">{value}</p>
          <p className="relative text-[11.5px] text-gray">{label}</p>
        </div>
      ))}
    </div>
  );
}