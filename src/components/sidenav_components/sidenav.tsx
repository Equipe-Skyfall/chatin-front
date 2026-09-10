"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3, BookOpen, ClipboardList, MessageSquare, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/interfaces/chat_interfaces";

interface SidenavItem extends NavigationItem {
  href: string;
}

const navigationItems: SidenavItem[] = [
  { label: "Início", href: "/chat", icon: MessageSquare },
  { label: "Biblioteca", href: "/biblioteca", icon: BookOpen },
  { label: "Questionários", href: "/quiz", icon: ClipboardList },
  { label: "Progresso", href: "/progresso", icon: BarChart3 },
  { label: "Ajustes", href: "/config", icon: Settings },
];

export function Sidenav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[52px] shrink-0 flex-col items-center justify-between bg-charcoal py-4 text-white sm:w-[64px] sm:py-5">
      <div className="flex flex-col items-center gap-5 sm:gap-6">
        <Link href="/chat" aria-label="CHATin" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] bg-orange-light sm:h-9 sm:w-9">
          <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={36} height={36} className="h-full w-full object-contain" priority />
        </Link>
        <nav className="flex flex-col items-center gap-3" aria-label="Navegação principal">
          {navigationItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-[9px] transition-colors ${
                  isActive ? "bg-orange-light text-white" : "text-white/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              </Link>
            );
          })}
        </nav>
      </div>
      <button aria-label="Perfil de Eduardo" className="h-7 w-7 rounded-full border-2 border-orange-light bg-[#6B6B6B] text-[10px] font-semibold text-white sm:h-8 sm:w-8">
        ED
      </button>
    </aside>
  );
}