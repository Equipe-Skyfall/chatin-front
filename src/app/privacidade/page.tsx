import { LegalLayout } from "@/components/legal_components/legal_layout";
import { PoliticaPrivacidadeContent } from "@/components/legal_components/politica_privacidade_content";
import { POLITICA_ATUALIZADA_EM } from "@/lib/lgpd";

export default function PrivacidadePage() {
  return (
    <LegalLayout titulo="Política de Privacidade" atualizadoEm={POLITICA_ATUALIZADA_EM}>
      <PoliticaPrivacidadeContent />
    </LegalLayout>
  );
}
