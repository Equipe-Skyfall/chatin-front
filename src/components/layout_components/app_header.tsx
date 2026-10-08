"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useNavMenu } from "@/components/layout_components/nav_menu_context";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle = "Assistente de estudos" }: AppHeaderProps) {
  const { abrir } = useNavMenu();

  return (
    <header className="flex h-[66px] shrink-0 items-center gap-2 border-b border-line bg-white px-4 sm:gap-3 sm:px-7">
      <button
        type="button"
        onClick={abrir}
        aria-label="Abrir menu"
        className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-surface md:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden">
          <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={50} height={50} className="h-full w-full" priority />
          <span className="absolute mt-5 ml-5 h-2.5 w-2.5 rounded-full border border-white bg-[#46c779]" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-sm font-semibold leading-tight text-charcoal">{title}</h1>
          <p className="truncate text-[10px] text-gray">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
