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

## Tela de apostila (US-11)

É a tela principal de estudo da matéria: o conteúdo é apresentado como uma apostila, com sumário navegável e tipografia de leitura longa.

Rotas:

- `/apostilas` (`apostilas_page.tsx`) — lista as matérias em `MateriaCard`. Clicar num cartão abre a leitura; o dialog `CriarMateriaDialog` cria uma nova e já entra nela.
- `/apostilas/[materiaId]` (`materia_leitura_page.tsx`) — a leitura em si. A query `?modulo=<id>` abre direto num módulo (usado pelo ▶ das trilhas). Ambas são rotas privadas (`PRIVATE_ROUTES` em `src/proxy.ts`).

Componentes (`src/components/materias_components/`, um por arquivo):

- `materia_reader.tsx` — o "miolo" da tela: sumário (capítulos → módulos), cabeçalho do módulo, navegação Anterior/Próximo e os estados de carregando/bloqueado/vazio. No mobile o sumário vira um `<details>`.
- `tema_trilha_item.tsx` — um capítulo do sumário, com o indicador de estado do quiz de cada módulo.
- `apostilas_markdown.tsx` — renderiza o conteúdo (Markdown + GFM + LaTeX via `remark-math`/`rehype-katex`). O corpo usa fonte serifada (`font-serif`), contrastando com o `font-display` dos títulos. Normalize delimitadores `\(...\)`/`\[...\]` com `normalizeMathDelimiters` (`src/lib/latex.ts`) antes de renderizar.
- `materia_card.tsx` — cartão da lista de matérias.

Estado (`src/hooks/`):

- `use_materias.ts` — lista da `GET /materias`.
- `use_materia_leitura.ts` — carrega matéria, temas e módulos e decide qual módulo abrir: o módulo pedido na URL (se acessível) ou o primeiro liberado que ainda não foi concluído. Os estados `bloqueado`/`disponivel`/`concluido` vêm da `/trilha`.
- `use_progresso_leitura.ts` — progresso de rolagem da página (barra no topo).

Regras de acesso: o **backend** é quem decide o que pode ser lido. Módulos de um tópico `bloqueado` nem entram na navegação Anterior/Próximo e não são buscados. Quando o backend nega o conteúdo de um módulo (403/409/422), a tela mostra o estado "Conteúdo bloqueado" com atalho para os questionários — o front não replica a regra de liberação.

Testes: `tests/components/materia_reader_test.tsx`, `tests/hooks/use_materia_leitura_test.tsx`, `tests/pages/materia_leitura_page_test.tsx` e o caso de `/apostilas` em `tests/middleware/proxy_rotas_test.ts`.
