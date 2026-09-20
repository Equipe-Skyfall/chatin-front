"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { ContentManager } from "@/components/admin_components/content_manager";
import { useUserRole } from "@/hooks/use_user_role";

export default function ConteudoPage() {
  const router = useRouter();
  const papel = useUserRole();

  useEffect(() => {
    if (papel === "UNKNOWN") return;

    if (papel === null) {
      router.replace("/");
      return;
    }

    if (papel !== "ADMIN") {
      toast.error("Acesso restrito a administradores.");
      router.replace("/chat");
    }
  }, [papel, router]);

  return (
    <main className="flex h-dvh overflow-hidden bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Criar conteúdo" subtitle="Área do administrador" />
        <div className="min-h-0 flex-1 overflow-hidden">
          {papel === "ADMIN" ? (
            <ContentManager />
          ) : (
            <p className="px-4 py-6 text-[12px] text-gray sm:px-7">Verificando permissões...</p>
          )}
        </div>
      </section>
    </main>
  );
}
