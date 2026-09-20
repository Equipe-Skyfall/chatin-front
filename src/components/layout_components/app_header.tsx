import Image from "next/image";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle = "Assistente de estudos" }: AppHeaderProps) {
  return (
    <header className="flex h-[66px] items-center border-b border-line bg-white px-5 sm:px-7">
      <div className="flex items-center gap-3">
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden">
          <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={50} height={50} className="h-full w-full" priority />
          <span className="absolute h-2.5 w-2.5 rounded-full mt-5 ml-5 border border-white bg-[#46c779]" />
        </div>
        <div>
          <h1 className="font-display text-sm font-semibold leading-tight text-charcoal">{title}</h1>
          <p className="text-[10px] text-gray">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}