import { LegalLayout } from "@/components/legal_components/legal_layout";
import { TermosUsoContent } from "@/components/legal_components/termos_uso_content";
import { TERMOS_ATUALIZADOS_EM } from "@/lib/lgpd";

export default function TermosPage() {
  return (
    <LegalLayout titulo="Termos de Uso" atualizadoEm={TERMOS_ATUALIZADOS_EM}>
      <TermosUsoContent />
    </LegalLayout>
  );
}
