"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useNavMenu } from "@/components/layout_components/nav_menu_context";

export interface ProgressoHeader {
  percentual: number;
  concluidos: number;
  total: number;
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Progresso na matéria em estudo, mostrado à direita. */
  progresso?: ProgressoHeader;
}

export function AppHeader({ title, subtitle = "Assistente de estudos", progresso }: AppHeaderProps) {
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

      {progresso && (
        <div className="ml-auto flex w-28 shrink-0 flex-col gap-1 sm:w-44">
          <div
            className="h-2 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-label={`Progresso em ${title}`}
            aria-valuenow={progresso.percentual}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-orange transition-[width]" style={{ width: `${progresso.percentual}%` }} />
          </div>
          <p className="text-right text-[10px] text-gray">
            {progresso.concluidos} de {progresso.total} {progresso.total === 1 ? "módulo" : "módulos"}
          </p>
        </div>
      )}
    </header>
  );
}
