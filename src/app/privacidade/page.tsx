import { LegalLayout } from "@/components/legal_components/legal_layout";
import { PoliticaPrivacidadeContent } from "@/components/legal_components/politica_privacidade_content";

export default function PrivacidadePage() {
  return (
    <LegalLayout titulo="Política de Privacidade">
      <PoliticaPrivacidadeContent />
    </LegalLayout>
  );
}
