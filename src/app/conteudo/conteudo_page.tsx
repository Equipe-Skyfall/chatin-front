"use client";

import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { ContentManager } from "@/components/admin_components/content_manager";

export default function ConteudoPage() {
  return (
    <main className="flex h-dvh overflow-hidden bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Criar conteúdo" subtitle="Área do administrador" />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ContentManager />
        </div>
      </section>
    </main>
  );
}
