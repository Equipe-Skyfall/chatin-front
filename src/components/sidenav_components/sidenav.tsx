"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, ClipboardList, FilePlus2, LogOut, MessageSquare, User, X } from "lucide-react";
import { toast } from "sonner";
import { limparSessao, useSession } from "@/hooks/use_session";
import { logout } from "@/lib/auth";
import type { NavigationItem } from "@/interfaces/chat_interfaces";
import { ConfirmDialog } from "@/components/profile_components/confirm_dialog";
import { useNavMenu } from "@/components/layout_components/nav_menu_context";

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

interface NavLinkProps {
  item: SidenavItem;
  ativo: boolean;
  comLabel?: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, ativo, comLabel = false, onNavigate }: NavLinkProps) {
  const { label, href, icon: Icon } = item;

  const className = comLabel
    ? `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
        ativo ? "bg-sidebar-active text-sidebar-ink" : "text-sidebar-ink/85 hover:bg-sidebar-active hover:text-sidebar-ink"
      }`
    : `flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
        ativo ? "bg-sidebar-active text-sidebar-ink" : "text-sidebar-ink/85 hover:bg-sidebar-active hover:text-sidebar-ink"
      }`;

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={ativo ? "page" : undefined}
      onClick={onNavigate}
      className={className}
    >
      <Icon size={comLabel ? 19 : 17} strokeWidth={ativo ? 2.2 : 1.8} />
      {comLabel && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidenav() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useSession();
  const { aberto, fechar } = useNavMenu();
  const [saindo, setSaindo] = useState(false);
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);

  const itensVisiveis = navigationItems.filter((item) => !item.somenteAdmin || role === "ADMIN");

  useEffect(() => {
    fechar();
  }, [pathname, fechar]);

  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") fechar();
    }

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, fechar]);

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
      setConfirmandoLogout(false);
    }
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[64px] shrink-0 flex-col items-center justify-between bg-sidebar py-5 text-sidebar-ink md:flex">
        <div className="flex flex-col items-center gap-6">
          <Link href="/chat" aria-label="CHATin" className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg">
            <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={50} height={50} className="h-full w-full" priority />
          </Link>
          <nav className="flex flex-col items-center gap-3" aria-label="Navegação principal">
            {itensVisiveis.map((item) => (
              <NavLink key={item.href} item={item} ativo={pathname === item.href} />
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setConfirmandoLogout(true)}
          disabled={saindo}
          aria-label="Sair da conta"
          title="Sair da conta"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-ink/85 transition-colors hover:bg-sidebar-active hover:text-sidebar-ink disabled:opacity-60"
        >
          <LogOut size={17} strokeWidth={1.8} />
        </button>
      </aside>

      {aberto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={fechar} aria-hidden="true" />
          <nav
            className="absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col bg-sidebar px-3 py-4 text-sidebar-ink shadow-neo-raised"
            aria-label="Navegação principal"
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <Link href="/chat" aria-label="CHATin" className="flex items-center gap-2" onClick={fechar}>
                <Image src="/CHATin-LOGO.png" alt="Logo CHATin" width={40} height={40} className="h-10 w-10" priority />
                <span className="font-display text-sm font-semibold">CHATin</span>
              </Link>
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-ink/85 transition-colors hover:bg-sidebar-active hover:text-sidebar-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {itensVisiveis.map((item) => (
                <NavLink key={item.href} item={item} ativo={pathname === item.href} comLabel onNavigate={fechar} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setConfirmandoLogout(true)}
              disabled={saindo}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-sidebar-ink/85 transition-colors hover:bg-sidebar-active hover:text-sidebar-ink disabled:opacity-60"
            >
              <LogOut size={19} strokeWidth={1.8} />
              Sair da conta
            </button>
          </nav>
        </div>
      )}

      <ConfirmDialog
        open={confirmandoLogout}
        title="Sair da conta"
        description="Tem certeza que deseja sair? Você precisará fazer login novamente para continuar."
        confirmLabel="Sair"
        loadingLabel="Saindo..."
        loading={saindo}
        onConfirm={handleLogout}
        onCancel={() => setConfirmandoLogout(false)}
      />
    </>
  );
}
