# AGENTS.md — chatin-front

Convenções específicas deste repositório (frontend). Convenções comuns aos dois repos (padrão de commit, PR, review, arquitetura geral) vivem em `../docs/AGENTS.md` (raiz do monorepo `chatin`) — leia aquele primeiro.

## Stack

Next.js (App Router), Tailwind CSS, Lucide (ícones), Zod (validação de payload espelhando os schemas Pydantic do backend), react-hook-form.

Não adicione uma nova biblioteca sem antes verificar se uma das já escolhidas resolve o problema. Se for realmente necessária, justifique no PR.

## Ambiente e segurança

- Segredos (chaves de API, credenciais de banco) ficam **somente** em variáveis de ambiente (`.env`, não commitado). Nunca hardcode uma chave no código, mesmo "temporariamente".
- Ao gerar código que chama a IA (Gemini), sempre trate o caso de falha/indisponibilidade sem quebrar o restante da aplicação (ver RNF6 no DoR).
- Toda chamada à IA deve poder ser contabilizada (RNF7) — não crie chamadas "soltas" fora do mecanismo de registro de consumo.

## Autenticação e sessão

- O navegador **nunca** recebe o JWT. O login passa por `POST /api/auth/login` (route handler em `src/app/api/auth/`), que guarda o token num cookie `HttpOnly` no próprio domínio e devolve apenas `{ success, expiresAt }`.
- Todo acesso ao `chatin-back` passa pelo proxy autenticado `src/app/api/study/[...path]` — ele injeta o `Authorization: Bearer` no servidor. O cliente fala só com `/api/study/...` (same-origin, sem CORS e sem header de auth manual).
- O papel do usuário vem de `GET /api/auth/session` (validado no `/auth/profile`), nunca de decodificar o token no cliente. Não usar `localStorage` para token, papel ou expiração.
- `src/proxy.ts` faz apenas redirect de navegação (rota privada sem cookie → `/`). Ele **não** verifica a assinatura do JWT e não é a fronteira de autorização — a fronteira é o backend.
- URLs dos serviços (`AUTH_API_URL`, `STUDY_API_URL`) são variáveis de ambiente **server-only** (sem prefixo `NEXT_PUBLIC_`). Ver `.env.example`.
- Nunca commitar um JWT no código, mesmo "de teste".

### Cache e volume de requisições

O serviço de auth responde `429` se receber requisições demais, então evite chamadas supérfluas:

- `src/lib/session.ts` mantém um cache em memória por token: sessão válida por **30s**, indisponibilidade por **5s** (funciona como backoff em cima de `429`/`5xx`). `invalidarCacheSessao(token)` é chamado no logout e quando o token é rejeitado.
- `studyRequest` deduplica leituras em voo e reaproveita `GET` por **10s**; qualquer escrita (`POST`/`PUT`/`DELETE`) descarta o cache. Para polling, usar `{ skipCache: true }` (é o que `use_content_manager` faz ao acompanhar a geração).
- `useSession` é um store compartilhado: uma única requisição de sessão por página, independente de quantos componentes o consomem.
- Nunca cachear resposta de sessão sem chavear pelo token — dado de um usuário não pode vazar para outro.

## Padrão de commits

Formato: `TIPO - descrição curta no imperativo`.

| Tipo | Uso |
|---|---|
| `FEAT` | Novo recurso ou funcionalidade |
| `FIX` | Correção de bug |
| `CHORE` | Manutenção que não afeta lógica/visual (deps, configs) |
| `DOCS` | Alteração de documentação |
| `STYLE` | Formatação, sem mudar lógica |
| `REFACTOR` | Refatoração sem adicionar feature nem corrigir bug |
| `TEST` | Adiciona/ajusta testes |
| `PERF` | Melhoria de performance |
| `REVERT` | Reverte um commit anterior |
| `HOTFIX` | Correção urgente de bug crítico |

Exemplo: `FEAT - Adiciona geração de resumo a partir da conversa`

Branches: `main` (estável) e `dev` (desenvolvimento). Nunca commitar direto na `main`.

Um arquivo de página (`src/app/**/*_page.tsx`) deve conter só orquestração: estado da tela, chamadas à API, e composição dos componentes visuais — não a definição desses componentes. Se uma página cresce e passa a declarar mais de um componente auxiliar (`function AlgumaCoisa(...)`) dentro do próprio arquivo, extraia cada um pra um arquivo próprio em `src/components/{feature}_components/`, seguindo o padrão já usado por `chat_components/`, `admin_components/` e `quiz_components/` (um componente por arquivo, nome do arquivo em `snake_case`, export nomeado em `PascalCase`).

Isso evita páginas de 300+ linhas misturando lógica de estado com múltiplos componentes de UI diferentes (foi o que aconteceu com `quiz_page.tsx` antes de ser dividido em `TrilhaView`/`QuizRunner`/`QuizResultado`) — cada componente extraído fica testável e reutilizável isoladamente, e o arquivo de página vira só o "roteiro" da tela.

## Chamadas à API

Toda chamada HTTP passa por `src/lib/api.ts` (`request` pro serviço de auth externo, `studyRequest` pro chatin-back — este já anexa o Bearer token automaticamente). Não crie um novo wrapper `fetch` paralelo por feature; isso já causou bug de configuração divergente de ambiente uma vez (duas envs diferentes apontando pro mesmo backend).

## Uso do DESIGN.md

Qualquer código de interface (componentes, telas, estilos) deve seguir os tokens definidos em `docs/DESIGN.md` (cores, tipografia, espaçamento, raio de borda, sombras). Antes de escrever uma classe Tailwind com uma cor ou tamanho "solto", verifique se já existe um token equivalente.

Se uma tela nova exigir algo que o `DESIGN.md` ainda não cobre (uma cor nova, um componente novo), **atualize o `DESIGN.md` primeiro**, em um commit `DOCS`, e só depois implemente a tela usando esse novo token. Isso mantém o arquivo como fonte única de verdade da identidade visual, em vez de cada tela inventar seu próprio estilo.

## Padrão de testes (frontend)

`Vitest` + `Testing Library`. Todo teste deve poder rodar localmente sem depender de uma chave de API real — mocke as chamadas em `src/lib/api.ts`, não o `fetch` global.
