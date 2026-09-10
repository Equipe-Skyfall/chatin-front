import { AppHeader } from "@/components/layout_components/app_header";
import { Sidenav } from "@/components/sidenav_components/sidenav";

interface EmptyPageProps {
  title: string;
}

export function EmptyPage({ title }: EmptyPageProps) {
  return (
    <main className="flex min-h-screen bg-surface">
      <Sidenav />
      <section className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} />
      </section>
    </main>
  );
}