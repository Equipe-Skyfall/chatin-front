import { LegalLayout } from "@/components/legal_components/legal_layout";
import { TermosUsoContent } from "@/components/legal_components/termos_uso_content";

export default function TermosPage() {
  return (
    <LegalLayout titulo="Termos de Uso">
      <TermosUsoContent />
    </LegalLayout>
  );
}
