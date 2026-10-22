import { GraduationCap } from "lucide-react";

interface ComecarLicaoButtonProps {
  onComecar: () => void;
  carregando?: boolean;
}

export function ComecarLicaoButton({ onComecar, carregando = false }: ComecarLicaoButtonProps) {
  return (
    <div className="flex justify-center border-t border-line bg-surface px-4 py-4">
      <button
        type="button"
        onClick={onComecar}
        disabled={carregando}
        className="flex max-w-full items-center justify-center gap-2 rounded-full bg-orange px-6 py-3.5 text-[15px] font-semibold text-white shadow-neo-raised-sm transition hover:bg-orange-light focus-visible:ring-4 focus-visible:ring-orange/30 focus-visible:outline-none active:shadow-neo-inset-sm disabled:cursor-wait disabled:opacity-70 sm:px-10"
      >
        <GraduationCap size={18} />
        {carregando ? "Preparando a lição..." : "Começar lição"}
      </button>
    </div>
  );
}
