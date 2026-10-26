import Link from "next/link";
import { CONTATO_URL } from "@/lib/lgpd";

export function TermosUsoContent() {
  return (
    <>
      <p>
        <em>
          Documento modelo, pendente de revisão jurídica. Ao criar uma conta na CHATin você concorda com os
          termos abaixo.
        </em>
      </p>

      <h2>1. Aceitação dos termos</h2>
      <p>
        Ao se cadastrar e utilizar a CHATin, você declara ter lido, compreendido e aceito integralmente estes
        Termos de Uso e a <Link href="/privacidade">Política de Privacidade</Link>. Caso não concorde, não
        utilize a plataforma.
      </p>

      <h2>2. Descrição do serviço</h2>
      <p>
        A CHATin é uma plataforma de estudos assistida por inteligência artificial que oferece trilhas de
        aprendizado, apostilas, questionários e um assistente conversacional. O conteúdo e as respostas
        geradas pela IA têm finalidade educacional e informativa.
      </p>

      <h2>3. Conta do usuário</h2>
      <p>
        Para usar a plataforma é necessário criar uma conta com nome de usuário, e-mail e senha. Você é
        responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua
        conta. As informações fornecidas devem ser verdadeiras e atualizadas.
      </p>

      <h2>4. Uso aceitável</h2>
      <p>Ao utilizar a CHATin, você concorda em não:</p>
      <ul>
        <li>Usar a plataforma para fins ilícitos ou que violem direitos de terceiros;</li>
        <li>Tentar acessar contas, dados ou áreas restritas sem autorização;</li>
        <li>Sobrecarregar, interferir ou comprometer a segurança e o funcionamento do serviço;</li>
        <li>Copiar, revender ou explorar comercialmente o conteúdo sem autorização.</li>
      </ul>

      <h2>5. Conteúdo gerado por inteligência artificial</h2>
      <p>
        As respostas, resumos e materiais produzidos pela IA podem conter imprecisões, omissões ou erros. Eles{" "}
        <strong>não substituem</strong> orientação educacional, profissional ou de qualquer outra natureza, e
        devem ser conferidos com fontes confiáveis antes de serem usados para decisões importantes.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        A marca, a interface e o software da CHATin pertencem aos seus titulares. O conteúdo que você cria na
        plataforma permanece seu; ao publicá-lo, você concede à CHATin uma licença para exibi-lo e processá-lo
        com a finalidade de operar o serviço.
      </p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        A CHATin é fornecida &quot;como está&quot;. Na máxima extensão permitida pela lei, não nos
        responsabilizamos por danos indiretos decorrentes do uso do serviço ou da confiança depositada no
        conteúdo gerado pela IA.
      </p>

      <h2>8. Suspensão e encerramento</h2>
      <p>
        Podemos suspender ou encerrar o acesso de contas que violem estes termos ou que representem risco à
        segurança da plataforma e dos demais usuários.
      </p>

      <h2>9. Alterações destes termos</h2>
      <p>
        Estes termos podem ser atualizados para refletir mudanças no serviço ou na legislação. A data de
        última atualização será sempre exibida no topo desta página. O uso continuado após uma atualização
        representa a sua concordância com a nova versão.
      </p>

      <h2>10. Contato</h2>
      <p>
        Dúvidas sobre estes termos podem ser enviadas pelos canais oficiais do projeto:{" "}
        <a href={CONTATO_URL} target="_blank" rel="noopener noreferrer">
          {CONTATO_URL}
        </a>
        .
      </p>
    </>
  );
}
