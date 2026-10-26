import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { CONTATO_EMAIL, DIREITOS_TITULAR } from "@/lib/lgpd";

export function PrivacySection() {
  return (
    <div className="flex-1 rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-orange" />
        <h3 className="text-lg font-semibold text-[#18202b]">Seus direitos (LGPD)</h3>
      </div>
      <p className="mt-1 text-sm text-[#737a84]">
        Como titular de dados, você pode exercer os direitos previstos no art. 18 da Lei Geral de Proteção de Dados.
      </p>

      <ul className="mt-5 grid gap-2">
        {DIREITOS_TITULAR.map((direito) => (
          <li key={direito} className="flex items-start gap-2 text-sm text-[#4b5563]">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange" aria-hidden="true" />
            <span>{direito}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-[#4b5563]">
        Para exercer qualquer um destes direitos, fale com o nosso encarregado de dados:{" "}
        <a href={`mailto:${CONTATO_EMAIL}`} className="font-semibold text-orange hover:underline">
          {CONTATO_EMAIL}
        </a>
        .
      </p>
      <p className="mt-2 text-xs text-[#8b929b]">
        Algumas solicitações, como acesso, portabilidade e eliminação, são atendidas por pedido direto ao encarregado.
      </p>

      <Link
        href="/privacidade"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange hover:underline"
      >
        Ler a Política de Privacidade completa <ChevronRight size={16} />
      </Link>
    </div>
  );
}
