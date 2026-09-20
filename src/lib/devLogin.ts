// JWT de teste (HS256, assinado com o JWT_SECRET local do chatin-back) -
// só pra testar as telas sem depender do serviço de auth externo, que não
// reconhece o backend rodando localmente. Nunca usar isso fora de dev.
const TOKEN_TESTE_ALUNO =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHRlc3QwMDAwYWx1bm8wMDAwMDAwMDEiLCJyb2xlIjoiVVNFUiIsInVzZXJuYW1lIjoiYWx1bm8tdGVzdGUiLCJlbWFpbCI6ImFsdW5vLXRlc3RlQGV4YW1wbGUuY29tIiwiaWF0IjoxNzg5ODUxOTkwLCJleHAiOjE4OTM0NTYwMDB9.zvl35WIGtFhdWdB1Xtk3JJSd3Mba6XHvMZFUyrDHDL4";

export function entrarModoTeste() {
  localStorage.setItem("skytrack_token", TOKEN_TESTE_ALUNO);
  localStorage.setItem("skytrack_token_expires", "2027-01-01T00:00:00.000Z");
  window.location.reload();
}
