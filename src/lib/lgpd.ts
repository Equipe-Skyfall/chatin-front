export const CONTATO_EMAIL = "equipeskyfall04@gmail.com";
export const VERSAO_TERMOS = "1.0";
export const VERSAO_POLITICA = "1.0";

export const DIREITOS_TITULAR = [
  "Confirmação da existência de tratamento;",
  "Acesso aos seus dados;",
  "Correção de dados incompletos, inexatos ou desatualizados;",
  "Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;",
  "Portabilidade dos dados a outro fornecedor;",
  "Eliminação dos dados tratados com base no consentimento;",
  "Informação sobre as entidades com as quais compartilhamos dados;",
  "Revogação do consentimento.",
];

export function linkSolicitacao(assunto: string, corpo: string): string {
  return `mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}
