import Link from "next/link";
import { CONTATO_URL } from "@/lib/lgpd";

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
        A CHATin é a controladora dos dados pessoais tratados na plataforma. As decisões sobre o tratamento
        desses dados e os canais de contato estão descritos na seção 10.
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

      <h2>6. Cookies e sessão</h2>
      <p>
        Usamos apenas um cookie <strong>HttpOnly</strong> de sessão, que mantém você autenticado com segurança —
        ele não é acessível por scripts da página e não é usado para rastreamento. Ao sair da conta, esse cookie
        é apagado.
      </p>

      <h2>7. Retenção e eliminação</h2>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa e pelo período necessário ao cumprimento de
        obrigações legais. Encerrada a finalidade, os dados são eliminados ou anonimizados.
      </p>

      <h2>8. Seus direitos (art. 18 da LGPD)</h2>
      <p>Como titular de dados, você pode a qualquer momento solicitar:</p>
      <ul>
        <li>Confirmação da existência de tratamento;</li>
        <li>Acesso aos seus dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
        <li>Portabilidade dos dados a outro fornecedor;</li>
        <li>Eliminação dos dados tratados com base no consentimento;</li>
        <li>Informação sobre as entidades com as quais compartilhamos dados;</li>
        <li>Revogação do consentimento.</li>
      </ul>

      <h2>9. Segurança da informação</h2>
      <p>
        Adotamos medidas técnicas e administrativas para proteger seus dados, incluindo o armazenamento do
        token de sessão em cookie inacessível a JavaScript e a limpeza de dados locais ao sair da conta.
      </p>

      <h2>10. Encarregado (DPO) e contato</h2>
      <p>
        Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento dos seus dados, fale com a equipe do
        projeto pelos canais oficiais:{" "}
        <a href={CONTATO_URL} target="_blank" rel="noopener noreferrer">
          {CONTATO_URL}
        </a>
        .
      </p>

      <h2>11. Alterações desta política</h2>
      <p>
        Esta política pode ser atualizada periodicamente. A data de última atualização é sempre exibida no topo
        desta página.
      </p>

      <p>
        Veja também os nossos <Link href="/termos">Termos de Uso</Link>.
      </p>
    </>
  );
}
