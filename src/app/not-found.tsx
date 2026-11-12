import Link from "next/link";
import { ErroTela, classeBotaoPrimario } from "@/components/erro_components/erro_tela";

export default function NotFound() {
  return (
    <ErroTela titulo="Página não encontrada" descricao="O endereço que você abriu não existe ou foi movido.">
      <Link href="/inicio" className={classeBotaoPrimario}>
        Ir para o início
      </Link>
    </ErroTela>
  );
}
