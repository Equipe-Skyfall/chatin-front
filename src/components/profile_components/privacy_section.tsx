import Link from "next/link";
import { ChevronRight, Mail, ShieldCheck } from "lucide-react";
import { CONTATO_EMAIL, DIREITOS_TITULAR, linkSolicitacao } from "@/lib/lgpd";

const SOLICITACOES = [
  {
    rotulo: "Solicitar acesso aos meus dados",
    assunto: "LGPD - Solicitação de acesso aos dados",
    corpo:
      "Olá, gostaria de solicitar acesso aos dados pessoais que vocês mantêm sobre mim.\n\n" +
      "Usuário: \nE-mail da conta: \n",
  },
  {
    rotulo: "Solicitar portabilidade dos meus dados",
    assunto: "LGPD - Solicitação de portabilidade dos dados",
    corpo:
      "Olá, gostaria de solicitar a portabilidade dos meus dados a outro fornecedor.\n\n" +
      "Usuário: \nE-mail da conta: \n",
  },
  {
    rotulo: "Solicitar exclusão da minha conta e dos meus dados",
    assunto: "LGPD - Solicitação de exclusão de dados",
    corpo:
      "Olá, gostaria de solicitar a exclusão da minha conta e dos dados pessoais que vocês mantêm sobre mim.\n\n" +
      "Usuário: \nE-mail da conta: \n",
  },
  {
    rotulo: "Revogar meu consentimento",
    assunto: "LGPD - Revogação de consentimento",
    corpo:
      "Olá, gostaria de revogar o meu consentimento para o tratamento dos meus dados pessoais.\n\n" +
      "Usuário: \nE-mail da conta: \n",
  },
];

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
        Para exercer qualquer um destes direitos, envie uma solicitação ao nosso encarregado de dados pelo
        e-mail{" "}
        <a href={`mailto:${CONTATO_EMAIL}`} className="font-semibold text-orange hover:underline">
          {CONTATO_EMAIL}
        </a>
        . Você pode usar um dos modelos abaixo, que já abrem o e-mail preenchido:
      </p>

      <ul className="mt-3 grid gap-2">
        {SOLICITACOES.map((solicitacao) => (
          <li key={solicitacao.rotulo}>
            <a
              href={linkSolicitacao(solicitacao.assunto, solicitacao.corpo)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm font-medium text-[#18202b] transition hover:border-orange hover:text-orange"
            >
              <Mail size={15} className="shrink-0 text-orange" aria-hidden="true" />
              {solicitacao.rotulo}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-[#8b929b]">
        A resposta é feita pelo encarregado pelo canal informado; solicitações de acesso, portabilidade e
        eliminação são atendidas por esse pedido direto.
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
