import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LoginBrand() {
  return (
    <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white">
      <span className="grid size-9 place-items-center rounded-[11px] bg-[#fb7118]">
        <Sparkles size={18} strokeWidth={2.5} />
      </span>
      CHATIN
    </Link>
  );
}