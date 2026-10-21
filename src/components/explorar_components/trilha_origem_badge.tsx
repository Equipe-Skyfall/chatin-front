import { BadgeCheck, Users } from "lucide-react";

export function TrilhaOrigemBadge({ verificada }: { verificada: boolean }) {
  return verificada ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#DDE9C5] px-2.5 py-1 text-[10.5px] font-semibold text-[#3f6b34]">
      <BadgeCheck size={12} aria-hidden="true" />
      Verificada
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#C3E9F6] px-2.5 py-1 text-[10.5px] font-semibold text-[#1f5870]">
      <Users size={12} aria-hidden="true" />
      Comunidade
    </span>
  );
}
