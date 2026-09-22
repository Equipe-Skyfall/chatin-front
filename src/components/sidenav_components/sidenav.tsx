"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, ClipboardList, FilePlus2, LogOut, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { limparSessao, useSession } from "@/hooks/use_session";
import { logout } from "@/lib/auth";
import type { NavigationItem } from "@/interfaces/chat_interfaces";

interface SidenavItem extends NavigationItem {
  href: string;
  somenteAdmin?: boolean;
}

const navigationItems: SidenavItem[] = [
  { label: "Início", href: "/chat", icon: MessageSquare },
  { label: "Biblioteca", href: "/biblioteca", icon: BookOpen },
  { label: "Questionários", href: "/quiz", icon: ClipboardList },
  { label: "Progresso", href: "/progresso", icon: BarChart3 },
  { label: "Criar conteúdo", href: "/conteudo", icon: FilePlus2, somenteAdmin: true },
  { label: "Perfil", href: "/perfil", icon: User },
];

export function Sidenav() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useSession();
  const [saindo, setSaindo] = useState(false);

  const itensVisiveis = navigationItems.filter((item) => !item.somenteAdmin || role === "ADMIN");

  async function handleLogout() {
    setSaindo(true);
    try {
      await logout();
      limparSessao();
      toast.success("Você saiu da sua conta.");
      router.push("/");
      router.refresh();
    } finally {
      setSaindo(false);
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[52px] shrink-0 flex-col items-center justify-between bg-sidebar py-4 text-sidebar-ink sm:w-[64px] sm:py-5">
      <div className="flex flex-col items-center gap-5 sm:gap-6">
        <Link href="/chat" aria-label="CHATin" className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg sm:h-16 sm:w-16">
          <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={50} height={50} className="h-full w-full " priority />
        </Link>
        <nav className="flex flex-col items-center gap-3" aria-label="Navegação principal">
          {itensVisiveis.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive ? "bg-white text-sidebar-active" : "text-sidebar-ink/85 hover:bg-white hover:text-sidebar-active"
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={saindo}
        aria-label="Sair da conta"
        title="Sair da conta"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-ink/85 transition-colors hover:bg-white hover:text-sidebar-active disabled:opacity-60"
      >
        <LogOut size={17} strokeWidth={1.8} />
      </button>
    </aside>
  );
}
