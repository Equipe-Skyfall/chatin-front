"use client";

import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";
import { ConsumoIaPainel } from "@/components/admin_components/consumo_ia_painel";

export default function ConsumoIaPage() {
  return (
    <main className="flex min-h-dvh bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Consumo de IA" subtitle="Área do administrador" />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
          <ConsumoIaPainel />
        </div>
      </section>
    </main>
  );
}
