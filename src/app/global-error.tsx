"use client";

import { useEffect } from "react";
import { ErroTela, classeBotaoPrimario, classeBotaoSecundario } from "@/components/erro_components/erro_tela";
import "./globals.css";

/** Última rede de segurança: substitui o layout raiz, então precisa trazer o
 * próprio <html>/<body>. Usa <a> (e não next/link) porque o router pode ser o
 * que quebrou. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <ErroTela titulo="Algo deu errado" descricao="O CHATin encontrou um problema inesperado. Tente novamente ou volte ao início.">
          <button type="button" onClick={reset} className={classeBotaoPrimario}>
            Tentar novamente
          </button>
          <a href="/inicio" className={classeBotaoSecundario}>
            Ir para o início
          </a>
        </ErroTela>
      </body>
    </html>
  );
}
