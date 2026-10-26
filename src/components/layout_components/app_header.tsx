"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { useNavMenu } from "@/components/layout_components/nav_menu_context";
import { AvisoIa } from "@/components/layout_components/aviso_ia";

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
  /** Ação no canto oposto ao título (ex.: Trocar matéria no chat). */
  acao?: ReactNode;
}

export function AppHeader({ title, subtitle = "Assistente de estudos", progresso, acao }: AppHeaderProps) {
  const { abrir } = useNavMenu();

  return [
    <header key="barra" className="flex h-[66px] shrink-0 items-center gap-2 border-b border-line bg-white px-4 sm:gap-3 sm:px-7">
      <button
        type="button"
        onClick={abrir}
        aria-label="Abrir menu"
        className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-surface md:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden sm:h-16 sm:w-16">
          <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={50} height={50} className="h-full w-full" priority />
          <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-white bg-[#46c779]" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-sm font-semibold leading-tight text-charcoal">{title}</h1>
          <p className="truncate text-[10px] text-gray">{subtitle}</p>
        </div>
      </div>

      {acao && <div className="ml-auto shrink-0">{acao}</div>}

      {progresso && (
        <div className={`${acao ? "ml-3 " : "ml-auto "}flex w-24 shrink-0 flex-col gap-1 sm:w-44`}>
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
    </header>,
    <AvisoIa key="aviso" />,
  ];
}
