import { BadgeCheck, Users } from "lucide-react";

export function TrilhaOrigemBadge({ verificada }: { verificada: boolean }) {
  return verificada ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-green px-2.5 py-1 text-[10.5px] font-semibold text-accent-green-ink">
      <BadgeCheck size={12} aria-hidden="true" />
      Verificada
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-blue px-2.5 py-1 text-[10.5px] font-semibold text-accent-blue-ink">
      <Users size={12} aria-hidden="true" />
      Comunidade
    </span>
  );
}
