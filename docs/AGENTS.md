# AGENTS.md — chatin-front

Convenções específicas deste repositório (frontend). Convenções comuns aos dois repos (padrão de commit, PR, review, arquitetura geral) vivem em `../docs/AGENTS.md` (raiz do monorepo `chatin`) — leia aquele primeiro.

## Stack

Next.js (App Router), Tailwind CSS, Lucide (ícones), Zod (validação de payload espelhando os schemas Pydantic do backend), react-hook-form.

Não adicione uma nova biblioteca sem antes verificar se uma das já escolhidas resolve o problema. Se for realmente necessária, justifique no PR.

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

Nunca coloque co-authored-by em qualquer commit

## Estrutura de componentes

Um arquivo de página (`src/app/**/*_page.tsx`) deve conter só orquestração: estado da tela, chamadas à API, e composição dos componentes visuais — não a definição desses componentes. Se uma página cresce e passa a declarar mais de um componente auxiliar (`function AlgumaCoisa(...)`) dentro do próprio arquivo, extraia cada um pra um arquivo próprio em `src/components/{feature}_components/`, seguindo o padrão já usado por `chat_components/` e `admin_components/` (um componente por arquivo, nome do arquivo em `snake_case`, export nomeado em `PascalCase`).

Isso evita páginas de 300+ linhas misturando lógica de estado com múltiplos componentes de UI diferentes — cada componente extraído fica testável e reutilizável isoladamente, e o arquivo de página vira só o "roteiro" da tela.

## Chamadas à API

Toda chamada HTTP passa por `src/lib/api.ts` (`request` pro serviço de auth, via `/api/auth`; `studyRequest` pro chatin-back, via `/api/study/[...path]`). Não crie um novo wrapper `fetch` paralelo por feature. O cliente **nunca** anexa um token manualmente nem fala direto com os serviços externos — os dois passam por route handlers same-origin que injetam a autenticação no servidor (cookie `HttpOnly`), então nunca chame `fetch` direto pra um domínio externo a partir de um Client Component. Ver "Autenticação e sessão" acima para os detalhes do fluxo.

## Uso do DESIGN.md

Qualquer código de interface (componentes, telas, estilos) deve seguir os tokens definidos em `docs/DESIGN.md` (cores, tipografia, espaçamento, raio de borda, sombras). Antes de escrever uma classe Tailwind com uma cor ou tamanho "solto", verifique se já existe um token equivalente.

Se uma tela nova exigir algo que o `DESIGN.md` ainda não cobre (uma cor nova, um componente novo), **atualize o `DESIGN.md` primeiro**, em um commit `DOCS`, e só depois implemente a tela usando esse novo token. Isso mantém o arquivo como fonte única de verdade da identidade visual, em vez de cada tela inventar seu próprio estilo.

## Padrão de testes (frontend)

`Vitest` + `Testing Library`. Todo teste deve poder rodar localmente sem depender de uma chave de API real — mocke as chamadas em `src/lib/api.ts`, não o `fetch` global.
