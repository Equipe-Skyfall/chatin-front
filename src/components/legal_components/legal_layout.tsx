import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface LegalLayoutProps {
  titulo: string;
  children: ReactNode;
}

export function LegalLayout({ titulo, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-surface px-6 py-10 text-[#18202b] sm:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#737a84] transition hover:text-orange"
        >
          <ArrowLeft size={16} /> Voltar para o login
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/CHATin-LOGO.png"
            alt="Logo CHATin"
            width={44}
            height={44}
            className="h-11 w-11"
            priority
          />
          <span className="font-display text-lg font-bold">CHATin</span>
        </div>

        <header className="mb-6">
          <h1 className="font-display text-[32px] font-bold tracking-[-.03em]">{titulo}</h1>
        </header>

        <article className="rounded-lg bg-white p-6 shadow-neo-raised sm:p-9 [&>*:first-child]:mt-0 [&_a]:font-semibold [&_a]:text-orange [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#18202b] [&_li]:leading-7 [&_li]:text-[#4b5563] [&_p]:mt-3 [&_p]:text-[15px] [&_p]:leading-7 [&_p]:text-[#4b5563] [&_strong]:font-semibold [&_strong]:text-[#27303a] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
          {children}
        </article>
      </div>
    </main>
  );
}
