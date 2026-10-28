"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErroTela, classeBotaoPrimario, classeBotaoSecundario } from "@/components/erro_components/erro_tela";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErroTela titulo="Algo deu errado" descricao="Não conseguimos mostrar esta tela. Tente novamente ou volte ao início.">
      <button type="button" onClick={reset} className={classeBotaoPrimario}>
        Tentar novamente
      </button>
      <Link href="/inicio" className={classeBotaoSecundario}>
        Ir para o início
      </Link>
    </ErroTela>
  );
}
