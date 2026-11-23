import Link from "next/link";
import { CONTATO_EMAIL, DIREITOS_TITULAR, VERSAO_POLITICA, VERSAO_TERMOS } from "@/lib/lgpd";

export function PoliticaPrivacidadeContent() {
  return (
    <>
      <p>
        <em>
          Documento modelo, pendente de revisão jurídica. Esta política descreve como a CHATin trata seus dados
          pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </em>
      </p>

      <h2>1. Quem somos (controlador)</h2>
      <p>
        O controlador dos seus dados pessoais é a <strong>Equipe Skyfall</strong>, responsável pelo projeto
        CHATin, a quem cabe decidir sobre o tratamento descrito nesta política. Contato:{" "}
        <a href={`mailto:${CONTATO_EMAIL}`}>{CONTATO_EMAIL}</a>.
      </p>

      <h2>2. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Dados de cadastro:</strong> nome de usuário e e-mail.
        </li>
        <li>
          <strong>Credenciais de acesso:</strong> senha (armazenada de forma protegida pelo serviço de
          autenticação).
        </li>
        <li>
          <strong>Dados de uso e estudo:</strong> trilhas, módulos, tentativas de questionário, progresso e
          pontuação.
        </li>
        <li>
          <strong>Conteúdo das conversas:</strong> mensagens trocadas com o assistente e os materiais que você
          cria ou envia.
        </li>
      </ul>
      <p>
        Não coletamos dados pessoais sensíveis nem utilizamos cookies de publicidade ou de rastreamento.
      </p>

      <h2>3. Finalidades do tratamento</h2>
      <ul>
        <li>Criar e manter sua conta e permitir o acesso à plataforma;</li>
        <li>Personalizar sua trilha de estudos e calcular seu progresso;</li>
        <li>Gerar respostas, resumos e conteúdos de estudo com a IA;</li>
        <li>Garantir a segurança, prevenir fraudes e cumprir obrigações legais.</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        Tratamos seus dados com base nas hipóteses do art. 7º da LGPD, conforme o caso:{" "}
        <strong>execução de contrato</strong> (para fornecer o serviço que você solicitou),{" "}
        <strong>consentimento</strong> (manifestado no momento do cadastro) e{" "}
        <strong>legítimo interesse</strong> (para segurança e melhoria da plataforma).
      </p>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>
        Para operar o serviço, compartilhamos dados com prestadores que atuam como operadores, sempre limitados
        à finalidade contratada:
      </p>
      <ul>
        <li>
          <strong>Serviço de autenticação</strong> — responsável por contas, login e senhas (hospedado na
          Vercel);
        </li>
        <li>
          <strong>Backend de estudo</strong> — armazena trilhas, progresso e conteúdo (hospedado na Render);
        </li>
        <li>
          <strong>Provedores de inteligência artificial</strong> — processam o conteúdo das conversas e dos
          materiais para gerar respostas e resumos.
        </li>
      </ul>
      <p>Não vendemos nem alugamos seus dados pessoais.</p>

      <h2>6. Transferência internacional de dados</h2>
      <p>
        Alguns dos operadores acima (por exemplo, os serviços de hospedagem — Vercel e Render — e os provedores
        de inteligência artificial) podem processar dados fora do Brasil. Nesses casos, a transferência observa
        os requisitos do art. 33 da LGPD e ocorre apenas para as finalidades descritas nesta política.
      </p>

      <h2>7. Cookies e sessão</h2>
      <p>
        Usamos apenas um cookie <strong>HttpOnly</strong> de sessão, que mantém você autenticado com segurança —
        ele não é acessível por scripts da página e não é usado para rastreamento. Ao sair da conta, esse cookie
        é apagado.
      </p>

      <h2>8. Retenção e eliminação</h2>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa e pelo período necessário ao cumprimento de
        obrigações legais. Encerrada a finalidade, os dados são eliminados ou anonimizados.
      </p>

      <h2>9. Seus direitos (art. 18 da LGPD)</h2>
      <p>Como titular de dados, você pode a qualquer momento solicitar:</p>
      <ul>
        {DIREITOS_TITULAR.map((direito) => (
          <li key={direito}>{direito}</li>
        ))}
      </ul>

      <h2>10. Decisões automatizadas</h2>
      <p>
        Parte do serviço usa processamento automatizado — por exemplo, as sugestões de estudo e as respostas do
        assistente geradas por inteligência artificial. Essas decisões orientam o seu estudo dentro da
        plataforma e não produzem efeitos fora dela. Você pode solicitar a revisão de uma decisão automatizada
        pelo canal do encarregado (seção 13).
      </p>

      <h2>11. Menores de idade</h2>
      <p>
        A plataforma não se destina a menores de 18 anos sem o consentimento de um responsável legal. Ao criar
        a conta, você declara ter 18 anos ou mais, ou contar com esse consentimento. Responsáveis legais podem
        exercer os direitos do titular pelo canal da seção 13 e solicitar a eliminação de dados de menores
        coletados sem o devido consentimento.
      </p>

      <h2>12. Segurança da informação</h2>
      <p>
        Adotamos medidas técnicas e administrativas para proteger seus dados, incluindo o armazenamento do
        token de sessão em cookie inacessível a JavaScript e a limpeza de dados locais ao sair da conta.
      </p>

      <h2>13. Encarregado (DPO) e contato</h2>
      <p>
        Nosso encarregado pelo tratamento de dados pessoais pode ser contatado pelo e-mail{" "}
        <a href={`mailto:${CONTATO_EMAIL}`}>{CONTATO_EMAIL}</a>. Use esse canal para exercer seus direitos ou
        esclarecer dúvidas sobre o tratamento dos seus dados.
      </p>

      <h2>14. Alterações desta política</h2>
      <p>
        Esta política pode ser atualizada periodicamente para refletir mudanças no serviço ou na legislação.
        Versão atual: {VERSAO_POLITICA} (Termos de Uso: {VERSAO_TERMOS}).
      </p>

      <p>
        Veja também os nossos <Link href="/termos">Termos de Uso</Link>.
      </p>
    </>
  );
}
