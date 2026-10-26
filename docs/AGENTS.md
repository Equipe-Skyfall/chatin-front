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

## LGPD (consentimento e direitos do titular)

O cadastro exige o aceite dos Termos de Uso e da Política de Privacidade. O checkbox é validado **só no front** pelo `registerFormSchema` (`src/lib/validation/auth.ts`), que estende o `registerSchema` (payload da API) com o campo `aceiteTermos`; o `RegisterForm` remove esse campo antes de chamar `registrar()`, então o payload de `/register` continua `{ username, email, password }`. Persistir o aceite (versão/data) depende do authservice.

Páginas legais públicas: **`/termos`** (`src/app/termos/page.tsx`) e **`/privacidade`** (`src/app/privacidade/page.tsx`), compostas pelo `LegalLayout` + um conteúdo em `src/components/legal_components/`. São rotas públicas (fora de `PRIVATE_ROUTES`/`PUBLIC_ONLY_ROUTES`). As datas, o e-mail do encarregado e a lista de direitos do titular ficam em `src/lib/lgpd.ts`.

No perfil, a aba **Privacidade** (`PrivacySection`) lista os direitos do titular (art. 18) e o e-mail do encarregado — é informativa, sem ação destrutiva.

## Uso do DESIGN.md

Qualquer código de interface (componentes, telas, estilos) deve seguir os tokens definidos em `docs/DESIGN.md` (cores, tipografia, espaçamento, raio de borda, sombras). Antes de escrever uma classe Tailwind com uma cor ou tamanho "solto", verifique se já existe um token equivalente.

Se uma tela nova exigir algo que o `DESIGN.md` ainda não cobre (uma cor nova, um componente novo), **atualize o `DESIGN.md` primeiro**, em um commit `DOCS`, e só depois implemente a tela usando esse novo token. Isso mantém o arquivo como fonte única de verdade da identidade visual, em vez de cada tela inventar seu próprio estilo.

## Padrão de testes (frontend)

`Vitest` + `Testing Library`. Todo teste deve poder rodar localmente sem depender de uma chave de API real — mocke as chamadas em `src/lib/api.ts`, não o `fetch` global.

## Tela de apostila (US-11)

É a tela principal de estudo da matéria: o conteúdo é apresentado como uma apostila, com sumário navegável e tipografia de leitura longa.

Rotas:

- `/apostilas` (`apostilas_page.tsx`) — lista as matérias em `MateriaCard`. O botão "Nova apostila" abre o `CriarMateriaDialog`; o cartão abre a leitura e, **nas apostilas do próprio aluno**, também oferece Editar / Conteúdo / Excluir.
- `/apostilas/[materiaId]` (`materia_leitura_page.tsx`) — a leitura em si. A query `?modulo=<id>` abre direto num módulo (usado pelo ▶ das trilhas).
- `/apostilas/[materiaId]/editar` (`apostila_editar_page.tsx`) — edição do conteúdo (tópicos/módulos) pelo dono. Todas são rotas privadas (`PRIVATE_ROUTES` em `src/proxy.ts`).

Componentes (`src/components/materias_components/`, um por arquivo):

- `materia_reader.tsx` — o "miolo" da tela: sumário (capítulos → módulos), cabeçalho do módulo, navegação Anterior/Próximo e os estados de carregando/bloqueado/vazio. No mobile o sumário vira um `<details>`.
- `tema_trilha_item.tsx` — um capítulo do sumário, com o indicador de estado do quiz de cada módulo.
- `apostilas_markdown.tsx` — renderiza o conteúdo (Markdown + GFM + LaTeX via `remark-math`/`rehype-katex`). O corpo usa fonte serifada (`font-serif`), contrastando com o `font-display` dos títulos. Normalize delimitadores `\(...\)`/`\[...\]` com `normalizeMathDelimiters` (`src/lib/latex.ts`) antes de renderizar.
- `materia_card.tsx` — cartão da lista de matérias.

Estado (`src/hooks/`):

- `use_materias.ts` — lista da `GET /materias`.
- `use_materia_leitura.ts` — carrega matéria, temas e módulos e decide qual módulo abrir: o módulo pedido na URL (se acessível), senão onde o aluno parou, senão o primeiro liberado que ainda não foi concluído. Os estados `bloqueado`/`disponivel`/`concluido` vêm da `/trilha`; o progresso de leitura vem do store abaixo.
- `use_progresso_leitura.ts` — progresso de rolagem da página (barra no topo).

Progresso de leitura (`src/lib/leitura_progresso.ts`): o backend só conhece o `estado` do módulo (resultado do quiz), não o que o aluno *leu*. Enquanto não houver endpoint de leitura no chatin-back, esse acompanhamento vive no `localStorage` do navegador (chave `chatin:progresso-leitura`, um registro por matéria) e guarda os módulos **acessados**, os **concluídos** e o **último módulo** aberto. O hook chama `registrarModuloAcessado` ao abrir/trocar de módulo e `registrarModuloConcluido`/`desmarcarModuloConcluido` no marcar/desmarcar como lido do leitor (desmarcar mantém o acesso e o ponto de retomada); ao voltar à matéria, `moduloParaRetomar` reabre onde o aluno parou e `contarLidos` conta quantos módulos da lista já foram lidos. A apresentação fica no `MateriaReader` (contador "X de Y módulos lidos", indicador `Lido` por módulo no sumário e um botão único no rodapé do módulo que alterna entre "Marcar como lido" e "Desmarcar como lido").

Regras de acesso: o **backend** é quem decide o que pode ser lido. Módulos de um tópico `bloqueado` nem entram na navegação Anterior/Próximo e não são buscados. Quando o backend nega o conteúdo de um módulo (403/409/422), a tela mostra o estado "Conteúdo bloqueado" com atalho para os questionários — o front não replica a regra de liberação. Se o `GET /modulos/:id` falhar de outra forma (ex.: um 500 do backend), o conteúdo mostra um estado de erro com "Tentar novamente" e o sumário segue navegável — a leitura não trava nem fica só num toast.

Apostilas do aluno (criar / editar / excluir): a apostila é **pública** — `GET /materias` devolve o currículo oficial + a trilha de todos os alunos, e qualquer aluno lê qualquer apostila. O dono é `owner_user_id` (`null` = oficial): a UI só oferece Editar/Conteúdo/Excluir quando `owner_user_id === session.user.id`, e o backend revalida (`verificar_acesso_escrita` → 403). "Editar" tem dois caminhos — os **dados** (`EditarMateriaDialog` → `PUT /materias/{id}`) e o **conteúdo** (rota `/apostilas/:id/editar`, que reusa `useContentManager` + `TemaSection`/`ModuloSection` do admin, escopados à matéria). Excluir usa `ConfirmDialog` → `DELETE /materias/{id}`. Criar usa o `CriarMateriaDialog` (`POST /materias` → `POST /temas`, rápido) e dispara a **geração em segundo plano** (`use_geracao_apostila`): o poll continua independente da tela, espera o tema sair de `'gerando'` para `'pronto'` e só então pede os módulos (`gerar-automaticamente`); o dialog fecha na hora, a lista mostra "Gerando conteúdo…" e um toast global avisa quando fica pronto (com ação "Abrir"). Votar (`POST|DELETE /materias/{id}/votar`) ainda não é usado pela UI.

Testes: `tests/components/materia_reader_test.tsx`, `tests/components/materia_card_test.tsx`, `tests/components/tema_trilha_item_test.tsx`, `tests/components/editar_materia_dialog_test.tsx`, `tests/hooks/use_materia_leitura_test.tsx`, `tests/lib/leitura_progresso_test.ts`, `tests/pages/apostilas_page_test.tsx`, `tests/pages/materia_leitura_page_test.tsx`, `tests/pages/apostila_editar_page_test.tsx` e o caso de `/apostilas` em `tests/middleware/proxy_rotas_test.ts`.
