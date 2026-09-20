import Image from "next/image";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle = "Assistente de estudos" }: AppHeaderProps) {
  return (
    <header className="relative z-10 flex h-[66px] items-center bg-surface px-5 shadow-neo-raised-sm sm:px-7">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-10 items-center justify-center overflow-hidden rounded-lg">
          <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={25} height={25} className="h-full w-full object-contain" priority />
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-surface bg-[#46c779]" />
        </div>
        <div>
          <h1 className="font-display text-sm font-semibold leading-tight text-charcoal">{title}</h1>
          <p className="text-[10px] text-gray">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
