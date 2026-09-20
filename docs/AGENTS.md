# AGENTS.md — CHATin

Este arquivo é o "README para agentes": contexto e convenções que qualquer agente de codificação (Claude Code, Cursor, Copilot, Codex etc.) deve seguir ao trabalhar neste repositório. Complementa o `README.md` (que é para humanos) e o `DESIGN.md` (que descreve a identidade visual).

## Visão geral do projeto

CHATin é um coach de estudos baseado em IA: o estudante conversa livremente com um assistente, que reconhece a matéria/tópico discutido, gera resumos, cria questionários e acompanha o progresso ao longo do tempo. Ver `README.md` para o backlog completo e `docs/DoR_CHATin.pdf` para critérios de aceitação.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js, Tailwind CSS, Lucide (ícones) |
| Backend | Python, FastAPI |
| Banco de dados | PostgreSQL |
| IA / PLN | Gemini |
| Design | Figma |
| Deploy | Vercel |

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

## Padrão de Pull Request

- **Título:** `[TIPO] Descrição curta` (mesmo vocabulário da tabela de commits acima, ex.: `[FEAT] Correção automática de questionário`).
- **Descrição obrigatória com 3 seções:**
  - `O que mudou` — resumo objetivo.
  - `Como testar` — passos manuais ou comando de teste automatizado.
  - `Screenshots` — obrigatório para qualquer mudança visual (comparar com `DESIGN.md`).
- PR pequeno e focado em uma única User Story ou Task sempre que possível.
- Nenhum PR é aprovado pelo próprio autor — sempre precisa de revisão de outra pessoa antes do merge (ver `Guia do GitHub` da API).

## Padrão de comentários em review de PR

Usar o padrão [Conventional Comments](https://conventionalcomments.org/) para deixar claro o peso de cada comentário:

- `nit:` — sugestão de estilo, não bloqueia o merge.
- `issue:` — problema que precisa ser corrigido antes do merge.
- `question:` — dúvida genuína, precisa de resposta antes de aprovar.
- `suggestion:` — proposta de mudança, com justificativa.
- `praise:` — reforço positivo (usar também, não só apontar problema).

Exemplo: `suggestion: extrair essa lógica de cálculo de XP para uma função separada, facilita testar isoladamente.`

## Padrão de testes

> A estratégia de testes ainda não foi formalizada pela equipe (item em aberto no checklist do DoR). Até que isso seja decidido, siga esta convenção mínima:

- Regras determinísticas (cálculo de XP, streak, correção automática de questionário, avanço/reforço de módulo) **devem ter teste unitário** — são lógica pura da aplicação, não dependem da IA, e são baratas de testar.
- Chamadas à IA (geração de resumo, geração de questionário, chat) não precisam de teste de conteúdo gerado, mas devem ter teste do comportamento de fallback (o que acontece quando a IA falha/está indisponível).
- Backend: `pytest`. Frontend: `Vitest` + `Testing Library`.
- Todo teste deve poder rodar localmente sem depender de uma chave de API real (usar mocks para chamadas ao Gemini).

## Uso do DESIGN.md

Qualquer código de interface (componentes, telas, estilos) deve seguir os tokens definidos em `DESIGN.md` (cores, tipografia, espaçamento, raio de borda). Antes de escrever uma classe Tailwind com uma cor ou tamanho "solto", verifique se já existe um token equivalente no `DESIGN.md`.

Se uma tela nova exigir algo que o `DESIGN.md` ainda não cobre (uma cor nova, um componente novo), **atualize o `DESIGN.md` primeiro**, em um commit `DOCS`, e só depois implemente a tela usando esse novo token. Isso mantém o arquivo como fonte única de verdade da identidade visual, em vez de cada tela inventar seu próprio estilo.
