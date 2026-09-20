# AGENTS.md — chatin-front

Convenções específicas deste repositório (frontend). Convenções comuns aos dois repos (padrão de commit, PR, review, arquitetura geral) vivem em `../docs/AGENTS.md` (raiz do monorepo `chatin`) — leia aquele primeiro.

## Stack

Next.js (App Router), Tailwind CSS, Lucide (ícones), Zod (validação de payload espelhando os schemas Pydantic do backend), react-hook-form.

Não adicione uma nova biblioteca sem antes verificar se uma das já escolhidas resolve o problema. Se for realmente necessária, justifique no PR.

## Estrutura de componentes

Um arquivo de página (`src/app/**/*_page.tsx`) deve conter só orquestração: estado da tela, chamadas à API, e composição dos componentes visuais — não a definição desses componentes. Se uma página cresce e passa a declarar mais de um componente auxiliar (`function AlgumaCoisa(...)`) dentro do próprio arquivo, extraia cada um pra um arquivo próprio em `src/components/{feature}_components/`, seguindo o padrão já usado por `chat_components/`, `admin_components/` e `quiz_components/` (um componente por arquivo, nome do arquivo em `snake_case`, export nomeado em `PascalCase`).

Isso evita páginas de 300+ linhas misturando lógica de estado com múltiplos componentes de UI diferentes (foi o que aconteceu com `quiz_page.tsx` antes de ser dividido em `TrilhaView`/`QuizRunner`/`QuizResultado`) — cada componente extraído fica testável e reutilizável isoladamente, e o arquivo de página vira só o "roteiro" da tela.

## Chamadas à API

Toda chamada HTTP passa por `src/lib/api.ts` (`request` pro serviço de auth externo, `studyRequest` pro chatin-back — este já anexa o Bearer token automaticamente). Não crie um novo wrapper `fetch` paralelo por feature; isso já causou bug de configuração divergente de ambiente uma vez (duas envs diferentes apontando pro mesmo backend).

## Uso do DESIGN.md

Qualquer código de interface (componentes, telas, estilos) deve seguir os tokens definidos em `docs/DESIGN.md` (cores, tipografia, espaçamento, raio de borda, sombras). Antes de escrever uma classe Tailwind com uma cor ou tamanho "solto", verifique se já existe um token equivalente.

Se uma tela nova exigir algo que o `DESIGN.md` ainda não cobre (uma cor nova, um componente novo), **atualize o `DESIGN.md` primeiro**, em um commit `DOCS`, e só depois implemente a tela usando esse novo token. Isso mantém o arquivo como fonte única de verdade da identidade visual, em vez de cada tela inventar seu próprio estilo.

## Padrão de testes (frontend)

`Vitest` + `Testing Library`. Todo teste deve poder rodar localmente sem depender de uma chave de API real — mocke as chamadas em `src/lib/api.ts`, não o `fetch` global.
