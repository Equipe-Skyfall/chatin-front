---
name: CHATin
colors:
  primary: "#F2711C"
  primary-light: "#FF7A1A"
  secondary: "#1E1E1E"
  tertiary: "#5CA382"
  neutral: "#EFEDE9"
  surface: "#EFEDE9"
  paper: "#fffdf8"
  on-surface: "#222222"
  on-surface-muted: "#6B6B6B"
  error: "#F26753"
  error-ink: "#a83f2e"
  sidebar: "#1E1E1E"
  sidebar-ink: "#FFFFFF"
  sidebar-active: "#F2711C"
  line: "#E2DED6"
  accent-blue: "#C3E9F6"
  accent-blue-ink: "#1f5870"
  accent-green: "#DDE9C5"
  accent-green-ink: "#3f6b34"
elevation:
  neo-raised: "3px 3px 6px rgba(163,148,128,0.16), -3px -3px 6px rgba(255,255,255,0.7)"
  neo-raised-sm: "2px 2px 4px rgba(163,148,128,0.14), -2px -2px 4px rgba(255,255,255,0.7)"
  neo-inset: "inset 2px 2px 4px rgba(163,148,128,0.16), inset -2px -2px 4px rgba(255,255,255,0.7)"
  neo-inset-sm: "inset 1px 1px 3px rgba(163,148,128,0.13), inset -1px -1px 3px rgba(255,255,255,0.7)"
  sidebar-inset: "inset 2px 2px 4px rgba(190,140,80,0.28), inset -2px -2px 4px rgba(255,255,255,0.55)"
typography:
  h1:
    fontFamily: Poppins
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.04em
  h2:
    fontFamily: Poppins
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.3
  body-md:
    fontFamily: Source Sans 3
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.4
  label-caps:
    fontFamily: Source Sans 3
    fontSize: 0.6875rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.06em
rounded:
  sm: 8px
  md: 12px
  lg: 20px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
---

## Overview

O CHATin usa uma linguagem visual de **SaaS educacional moderno com relevo neumimalista (soft-UI)**: superfícies claras e neutras, sem bordas visíveis, onde a hierarquia vem de sombras suaves e opostas (luz no topo-esquerda, sombra na base-direita) em vez de contornos. O relevo é sutil — o objetivo é transmitir "foco e credibilidade" para um momento importante (vestibular/ENEM), não um visual infantil ou decorativo.

A **sidebar de navegação é escura (`secondary`, #1E1E1E)** — um rail sóbrio à esquerda que ancora a interface. O acento laranja continua reservado para ações primárias, progresso e o item ativo/hover da navegação.

Evitar gradientes pesados, ilustrações 3D exageradas, excesso de cor e **relevos dramáticos** (sombras muito longas/opacas quebram a leitura de "limpo"). O Neumimalist aqui é a forma de elevação do sistema, não o tema inteiro.

## Colors

- **Primary (`#F2711C`):** laranja quente. Usado em botões primários (CTA), ícone ativo da sidebar, barra de progresso, badges de XP/streak. É a única cor "forte" da interface — usar com moderação, nunca como fundo de tela inteira.
- **Primary-light (`#FF7A1A`):** laranja de apoio, um passo mais vivo que o primary. Usado em botões preenchidos e bolhas do usuário no chat, onde o primary ficaria pesado.
- **Secondary (`#1E1E1E`):** quase-preto. Fundo da sidebar de navegação.
- **Sidebar (`#1E1E1E`):** a própria cor `secondary`, sólida e sem relevo. Fundo da navegação lateral.
- **Sidebar-ink (`#FFFFFF`):** branco. Cor dos ícones sobre a sidebar (inativos a ~85% de opacidade).
- **Sidebar-active (`#F2711C`):** o próprio laranja `primary`, usado como fundo atrás do ícone no estado ativo/hover (ver Sidebar em Components).
- **Tertiary (`#5CA382`):** verde. Usado em badges de status positivo (ex.: "Finalizado").
- **Neutral (`#EFEDE9`):** fundo geral das páginas **e** cor padrão dos cards. Por definição do Neumimalist, página e card compartilham a mesma cor — a separação vem do relevo.
- **Surface (`#EFEDE9`):** mesma cor do neutral. Cards, inputs (via inset) e painéis usam `surface`; não existe mais "card branco sobre fundo cinza".
- **Paper (`#fffdf8`):** branco levemente quente, a "folha" da apostila. Substitui o `surface` (cinza) nas superfícies de **leitura longa** (leitor, sumário e cartão de apostila) para dar cara de página impressa. Não usar como fundo de tela nem em elementos pequenos. (Ainda inline como `bg-[#fffdf8]` — candidato a virar token `paper`.)
- **Line (`#E2DED6`):** hairlines excepcionais (ex.: divisores internos, contorno de foco acessível). Borders de card/botão saíram de cena — o relevo é o contorno.
- **On-surface (`#222222`):** texto principal sobre fundo claro.
- **On-surface-muted (`#6B6B6B`):** texto secundário, legendas, timestamps.
- **Error/Alerta (`#F26753`):** usado também no badge de streak (contexto motivacional, não só erro — mas reservar tons de vermelho/coral para estados de atenção/urgência).
- **Error-ink (`#a83f2e`):** tom escuro de `error`, para texto sobre fundos claros de `error` (ex.: a faixa de indisponibilidade da IA, mensagens de erro). Garante contraste no lugar de usar `#F26753` puro como cor de texto.
- **Accent-blue (`#C3E9F6`, texto `accent-blue-ink` `#1f5870`) / Accent-green (`#DDE9C5`, texto `accent-green-ink` `#3f6b34`):** cores de apoio para tags de categoria (ex.: matéria/tópico) na Biblioteca de Resumos e para o badge de origem das trilhas. Existem como tokens no `@theme` (`bg-accent-blue`, `text-accent-blue-ink`...); não usar hex inline. Usar em rotação para diferenciar categorias, nunca com significado fixo (não são "sucesso" ou "erro").

## Typography

- **Display/headings: Poppins** (`font-display`) — usada em títulos de página e de card.
- **Texto/interface: Source Sans 3** (`font-sans`, padrão do `body`).
- Apenas dois pesos por família: `400` (texto) e `600/700` (títulos/ênfase) — evitar mais variações.

- **H1:** títulos de página e de telas de auth (ex.: "Acessar conta", "Biblioteca de Resumos"). Sempre acompanhado de um subtítulo em `body-md` com `on-surface-muted`.
- **H2:** títulos de card/seção.
- **Body-md:** texto de interface padrão (mensagens do chat, descrições).
- **Body de leitura (apostila):** corpo em **fonte serifada** (`font-serif`, a serifada padrão do navegador — o projeto não traz uma serifada própria), `17px` com `leading-[1.8]`, reservado ao texto longo da apostila. Títulos continuam em `font-display`; a descrição do módulo e o contador de páginas vão em serifada itálica.
- **Body-sm:** metadados (datas, contadores).
- **Label-caps:** rótulos em caixa alta com leve espaçamento entre letras (ex.: "MÚLTIPLA ESCOLHA", "RANKING GLOBAL", "CARDS REVISADOS").

## Radius & Spacing

- **sm (8px):** inputs, tags pequenas, ícones de sidebar.
- **md (12px):** cards, botões, bolhas de chat.
- **lg (20px):** containers maiores (ex.: painel de marketing do login).
- **pill (999px):** badges (XP, streak, status), sempre com padding horizontal generoso.

Espaçamento em múltiplos de 8px (`sm`=8, `md`=16, `lg`=24, `xl`=32) — evitar valores arbitrários fora dessa escala.

## Elevation & Neumimalist

O sistema de elevação é **neominimalista**, não neomorfismo clássico. Diferença prática: neomorfismo usa um **par** de sombras opostas (clara no topo-esquerda + escura na base-direita) pra simular um relevo esculpido na própria superfície — é isso que lê como "plástico"/datado. Aqui usamos **uma sombra só**, escura e de baixa opacidade, como qualquer sombra plana de card moderno (Notion/Linear) — dá profundidade sem o efeito "carimbado". Por isso `neutral` e `surface` são a mesma cor (`#EFEDE9`), mas o relevo em si é só a sombra única, nunca o par.

Receitas disponíveis como utilitários Tailwind:

| Utilitário | Uso | Efeito |
|---|---|---|
| `shadow-neo-raised` | Cards, painéis, containers grandes | Elemento "para fora" da página |
| `shadow-neo-raised-sm` | Botões, badges, bolhas de chat, header | Relevo suave para elementos pequenos |
| `shadow-neo-inset` | Inputs, composer, área de conteúdo afundada | Elemento "para dentro" (pressionado) |
| `shadow-neo-inset-sm` | Badges de estado carimbados | Afundado discreto |

A sidebar é a única superfície da interface **sem nenhum relevo** — fundo escuro sólido (`secondary`), ícones brancos, e o estado ativo/hover é só troca de cor (fundo laranja atrás do ícone branco), nunca sombra.

Regras de uso:
- **Um relevo por elemento.** Não empilhar `raised` + borda + cor de fundo diferente.
- **Minimalista primeiro, relevo depois.** É "**Neu**morfismo + **minimalista**", não neomorfismo puro — a maioria da UI fica lisa (sem sombra nenhuma); relevo é reservado pra 2-3 níveis de hierarquia (card principal, botão de ação, item ativo), nunca em toda superfície da tela.
- **Nunca em elementos pequenos.** Badges, pills de estado, tags, alternativas de múltipla escolha e outros elementos de texto curto **não levam sombra** — usam só cor de fundo (`accent-blue`, `accent-green`, tons claros de `primary`/`error`/`tertiary`) e, no máximo, um `border` de 1px em `line`. Sombra em elemento pequeno é o erro mais comum que faz a tela parecer "plástico" (neomorfismo datado) em vez de minimalista.
- **Interação:** botões usam `raised` no estado normal e `inset` no estado `active` (afundam quando pressionados); inputs já nascem `inset` e ganham anel de foco laranja.
- **Contraste:** Neumimalist reduz contraste por natureza — texto nunca fica sobre relevo sem cor; botões primários permanecem **preenchidos de laranja com texto branco**.
- **Dark Neumimalist:** no painel escuro do login (`#0E0E0E`), o mesmo princípio vale com sombras claras/escuras de baixa opacidade sobre o preto.

## Components

### Sidebar
- Fundo `sidebar` (#1E1E1E, a cor `secondary`, sólida — **sem sombra/relevo nesta faixa**).
- **Desktop (`≥ md`, 768px):** rail estreito (64px) fixo à esquerda, só ícones. Ícones inativos em branco (`sidebar-ink`) a 85% de opacidade, sem fundo.
- **Mobile (`< md`):** o rail não aparece; a navegação vira um **drawer lateral** que desliza da esquerda sobre um backdrop `black/40`. O drawer usa o mesmo fundo `sidebar`, lista cada página com **ícone + nome** (e o botão de sair no rodapé). É aberto pelo hambúrguer do Header e fecha ao navegar, tocar no backdrop ou tecla Esc.
- **Hover e item ativo:** fundo laranja liso `sidebar-active` (#F2711C, sem sombra) atrás do ícone, que fica branco — o contraste vem da cor, não de relevo.
- Avatar de perfil no rodapé (desktop), com borda branca.

### Header (AppHeader)
- Barra superior clara (`bg-white` + `border-b border-line`) com logo (indicador de status verde), título (`font-display`) e subtítulo em `on-surface-muted`.
- **Mobile (`< md`):** é o único header da tela (o rail não aparece) e ganha um **botão hambúrguer** à esquerda que abre o drawer de navegação. O título/subtítulo da página são exibidos aqui, dentro desta mesma barra.

### Aviso de indisponibilidade da IA (AvisoIa)
- **Faixa fina e dispensável** logo abaixo do `AppHeader`, presente em todas as telas autenticadas. Só aparece quando uma operação de IA (chat, resumo, geração/regeneração de conteúdo, quiz) falha por indisponibilidade.
- Fundo em tom claro de `error` (`#F26753` a ~10%), texto em `error-ink` (`#a83f2e`), ícone `TriangleAlert` e botão de fechar (`X`).
- **Nunca bloqueia:** é uma faixa que empurra o conteúdo (não um modal/overlay); o aluno continua navegando e o aviso reaparece na próxima falha caso seja fechado. O texto orienta a tentar novamente depois.

### Botões
- **Primário:** fundo `primary-light`, texto branco, `rounded.md`, peso 700, `shadow-neo-raised-sm`; `hover` escurece, `active` troca para `shadow-neo-inset`. Usado para a ação principal da tela (ex.: "Entrar na Plataforma", "Enviar respostas", "+ Novo Questionário").
- **Secundário/outline:** fundo `surface`, texto `primary`, `shadow-neo-raised-sm` (o contorno vem do relevo, não de borda). Ex.: "Praticar", "Refazer Simulado".
- **Texto/link:** sem fundo e sem relevo, cor `primary`. Ações terciárias (ex.: "Pular Questão", "Ver ranking completo").

### Cards
- Fundo `surface`, `rounded.md`/`rounded.lg`, `shadow-neo-raised`, **sem borda e sem `bg-white`**.
- Cards de destaque (ex.: posição no ranking, resultado correto/incorreto) mantêm o fundo levemente colorido (`#FEF8F3`, `#DDE9C5/30`, `#F26753/10`) trocando a borda por `shadow-neo-inset-sm`.

### Inputs
- Fundo `surface`, `shadow-neo-inset`, sem borda visível, `rounded.sm`, ícone à esquerda quando aplicável (envelope, cadeado). Placeholder em `on-surface-muted`.
- **Foco:** anel `ring-4 ring-primary/15` + `border-primary` opcional para acessibilidade de teclado. Nunca remover o indicador de foco.

### Badges & Tags
- Formato `pill`, fundo em tom claro da cor semântica (ex.: `#FDF0DB` para XP, `#DDE9C5`/`#C3E9F6` para categorias), texto em tom mais escuro da mesma família.
- Badges de estado (Disponível/Concluído/Bloqueado) usam `shadow-neo-inset-sm` para parecerem "carimbados" na superfície.
- Sempre acompanhadas de um ícone pequeno quando representam uma métrica (raio para XP, fogo para streak).

### Chat
- **Bolhas do assistente:** fundo `surface` + `shadow-neo-raised-sm`, canto superior-esquerdo mais reto.
- **Bolhas do usuário:** fundo `primary-light`, texto branco, `shadow-neo-raised-sm`, canto superior-direito mais reto.
- **Composer:** campo afundado (`shadow-neo-inset`, `rounded.md`) + botões de anexo/áudio em `on-surface-muted`; botão de enviar circular `primary-light` com `shadow-neo-raised-sm`.
- **Fontes da web (`FontesPopover`):** chip `pill` no rodapé da resposta do assistente, ao lado de `hora · CHATin`, com ícone de link (`Link2`) e a contagem, em `primary-light` com fundo a ~15% de opacidade. Abre ao passar o mouse, ao focar ou ao tocar (toggle com `aria-expanded`) um card `surface` com `shadow-neo-raised` e título "FONTES NA WEB" em `label-caps`; cada item mostra o **título da página** (700) e o domínio (`on-surface-muted`) e abre em nova aba (`rel="noopener noreferrer"`). Quando a busca não devolve o título, o backend cai para o domínio — nesse caso o rótulo em negrito é derivado do fim da URL (ex.: `.../revolucao-francesa.htm` → "Revolucao francesa"), em vez de repetir o domínio na linha de baixo. Só aceita links `http(s)`. Acima de **5 fontes** a lista ganha rolagem própria (`max-h` de ~5 itens, `overflow-y-auto`) em vez de esticar o card. Abre para cima e vira para baixo quando não há espaço acima no container de rolagem.

### Trilha de módulos (caminho)
- Cada tópico é um card `surface` com um **caminho** em curva (SVG, traço tracejado `line` + traço `primary` até o módulo atual) e um nó circular por módulo, no mesmo estilo do `shadow-neo-raised-sm`.
- **Estados do nó:** concluído (`Check`, fundo `accent-green` `#DDE9C5` com texto/borda no tom escuro `#3f6b34`), atual (`Play`, fundo `primary`, com pulso), bloqueado (`Lock`, fundo `surface`, texto `on-surface-muted`).
- Clicar no nó expande/recolhe o painel de ações (Praticar / Realizar); nó bloqueado só mostra o aviso e faz "shake". O rótulo do módulo fica no lado oposto ao desvio da curva.
- Barra de progresso do tópico: `role="progressbar"` com nome acessível, preenchimento `primary`.
- **Caminho da trilha no Início e no seletor de conteúdo do chat:** o caminho animado (nós e curva) deixou o chat e vive no **Início** (`/inicio`): ao escolher uma trilha em "Minhas trilhas" (botão "Ver caminho"), o caminho aparece logo abaixo, com o rótulo "Toque no ▶ para ler em {matéria}". Tocar no ▶ de um módulo desbloqueado **abre a leitura dele na apostila** (`/apostilas/{materiaId}?modulo={moduloId}`), já no módulo escolhido (nó bloqueado não inicia). O mesmo painel aparece no seletor de conteúdo do chat ("Chat por matéria"), onde o rótulo vira "Toque no ▶ para conversar sobre {matéria}" e o ▶ **ancora o chat naquele módulo** — abre uma conversa nova, e é essa primeira mensagem que leva o `modulo_id` para a IA. No chat o corpo é só a conversa; o `AppHeader` mostra o título da matéria, o módulo no subtítulo e uma barra de progresso (`progresso`) à direita.
- **Lição do módulo (`ComecarLicaoButton`):** quando o aluno tenta o quiz sem a lição do módulo, o app o leva para o chat do módulo com o composer bloqueado e, fixo no rodapé, um pill laranja grande "Começar lição" (`rounded-full bg-orange`, `px-10 py-3.5`, texto 15px semibold branco, mesmas sombras/foco do pill "Seguir sem tema"). Ao tocar, o assistente abre o chat explicando o tema por completo (só uma vez por módulo). Enquanto a lição é gerada o texto vira "Preparando a lição..." e o botão fica desabilitado.
- **Animações** (`motion`): sempre sob `MotionConfig reducedMotion="user"`. Em elementos animados por `motion`, usar `transition-colors`/`transition-shadow` — nunca `transition` genérico, que inclui `transform` e briga com o `motion`.

### Apostila (lista, leitura e edição)
Telas de estudo teórico: **`/apostilas`** (lista), **`/apostilas/[materiaId]`** (leitura) e **`/apostilas/[materiaId]/editar`** (edição de tópicos/módulos, só do dono). O conteúdo é apresentado como uma **apostila** — superfície de "papel", tipografia de leitura longa e sumário navegável. Rota privada (em `PRIVATE_ROUTES`).

- **Superfície de papel (`paper` `#fffdf8`):** o leitor, o sumário e o `MateriaCard` usam fundo `#fffdf8` (em vez do `surface` cinza) para dar cara de página impressa, com relevo próprio (`0 1px 2px rgba(34,26,15,.06), 0 10px 30px rgba(34,26,15,.10)`; no card é mais curto e sobe no hover). Raios pequenos: `rounded-[6px]` no papel e `rounded-l-[3px] rounded-r-[10px]` no card. *(Esses valores de papel/relevo ainda estão inline — candidatos a virar tokens `paper` / `shadow-papel`.)*
- **Faixa da matéria:** o leitor tem uma **borda-esquerda de 1.5px** (`w-1.5`) na cor da matéria (`getSubjectColor`), que identifica a trilha sem poluir. O `MateriaCard` repete a ideia com uma **tira de 3.5px** (`w-3.5`) à esquerda, com um hairline `bg-black/15` na emenda.
- **Tipografia de leitura:** ver *Body de leitura (apostila)* em Typography — corpo serifado `17px`/`leading-[1.8]`, títulos em `font-display` (H1 `28px` → `34px` no `sm`). Os blocos de Markdown seguem os tokens: H2 com `border-b border-line`, listas com `marker:text-orange`, `blockquote` com `border-l-4 border-orange/60` e `bg-orange/5`, `code`/`pre` em `surface`, e **tabelas com rolagem horizontal**.
- **Sumário:** card de papel fixo (`w-80`) ao lado do leitor no `lg`; abaixo disso vira um `<details>` recolhível ("Sumário · X/Y módulos"). Traz o nome da matéria, uma **barra de progresso fina** (`h-1`, preenchida na cor da matéria, `role="progressbar"`) e dois contadores: "X de Y módulos concluídos" (quiz) e "X de Y módulos lidos" (`primary`, progresso de leitura local).
- **Capítulo no sumário (`TemaTrilhaItem`):** numeração ("Capítulo N", `label-caps`), um **nó circular** (`size-7`, `border-2` na cor da matéria) e um conector vertical de progresso (`w-[3px]`, `bg-line`, preenchido na cor, `duration-500`). Bloqueado: nó cinza (`#d1d5db`) com `Lock` e texto em `on-surface-muted`. Os módulos aparecem numerados (`N.1`, `N.2`…), com o ativo em `bg-orange/10` + texto `primary` e, à direita, até dois indicadores: **Lido** (`BookOpenCheck`, `primary`) e o estado do quiz — concluído (`Check`, `green-600`), disponível (bolinha `primary`) ou bloqueado (bolinha vazia `border-gray`). A legenda desses estados fica no pé do sumário.
- **Leitor do módulo:** rótulo `label-caps` "Capítulo N · {tema}" na cor da matéria; H1 do título; descrição em serifada itálica; linha de metadados (módulo X de Y · "N min de leitura" com `Clock`); `hr` em `line`. O rodapé é um card tracejado (`border-dashed border-line`, `bg-surface/60`) com "Terminou de ler?", o botão **Marcar/Desmarcar como lido** (outline `primary`) e a ação **Fazer o quiz** (pill `primary-light` → `/quiz?highlight=`) ou o selo **Quiz bloqueado** (`bg-white`, `on-surface-muted`). Abaixo, navegação **Anterior/Próximo** em `grid-cols-2` com cards outline (borda `line`, `hover` `orange`).
- **Estados do conteúdo:** "Conteúdo bloqueado" (`Lock` + atalho para os questionários), erro de carregamento (`TriangleAlert` + "Tentar novamente"), carregando e vazio ("Selecione um módulo…") — todos centralizados, em card de papel, com texto `body-md`/`on-surface-muted`.
- **Progresso de leitura:** linha fina fixa no topo (`h-[3px]`), na cor da matéria, refletindo a rolagem da página (`role="progressbar"`, "Progresso de leitura"). É `localStorage` (não vai ao backend) — ver AGENTS.md.
- **Lista (`/apostilas`):** cabeçalho "Apostilas" + botão **Nova apostila** (`primary-light`, `shadow-neo-raised-sm`); grade `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (estados de carregando/vazio/erro iguais aos de `/progresso`). O `MateriaCard` mostra o ícone da matéria, selo `label-caps` "Sua apostila"/"Apostila", título (`font-display` `17px`), descrição serifada (`line-clamp-3`), votos (`ThumbsUp`) e "Abrir apostila →" (ou "Gerando conteúdo…" com `Loader2` enquanto a IA gera). Só o dono vê a faixa de ações **Editar / Conteúdo / Excluir** (pills outline; Excluir aparece em `#d1442e` no hover).
- **Diálogos de criação/edição:** sobreposição `bg-black/40` com painel `max-w-md` (`bg-white`, `rounded.lg`); inputs `border-line` com foco `border-orange`; ação primária `primary-light`.
- **Chat flutuante (`ChatinFlutuante`):** balão fixo no canto inferior direito (`size-16`, círculo `primary` com a logo). Abre um painel `bg-white` (`max-w-[380px]`, `h-[70vh] max-h-[560px]`, `rounded.lg`, `shadow-neo-raised`) com cabeçalho `primary` e as **mesmas bolhas/composer do Chat**. Serve para tirar dúvidas sobre o módulo aberto, sem sair da leitura.

### Modal (Modal)
- Componente genérico (`ui_components/modal.tsx`) para formulários e detalhes que pedem foco: sobreposição `fixed inset-0` em `bg-black/40`, renderizada em portal, e painel `surface` com `rounded.lg` e `shadow-neo-raised`, largura máxima `max-w-lg` (`max-w-2xl` para detalhes).
- Cabeçalho com título (`font-display`, H2) e botão de fechar (`X`, `on-surface-muted`). Rodapé de ações alinhado à direita: secundário à esquerda do primário.
- Acessibilidade: `role="dialog"`, `aria-modal`, `aria-labelledby` no título; fecha com `Esc`, clique no fundo ou no `X`; o foco entra no painel ao abrir e volta ao elemento que o abriu ao fechar; a rolagem da página fica travada enquanto aberto.
- Modal de confirmação destrutiva continua sendo o `ConfirmDialog`.

### Chips de filtro (FiltroChips)
- Grupo de botões `pill` em linha, com `aria-pressed`. Inativo: fundo `surface` e texto `on-surface-muted`, com `border` de 1px em `line` (sem sombra, como os demais badges). Ativo: fundo `primary` a ~15% (`#F2711C`/15), texto `primary` e `border` `primary`.
- Usados em "Explorar trilhas" para origem (Todas, Verificadas, Comunidade) e ordenação (Mais votadas, Mais alunos, Recentes).

### Badge de origem da trilha (Verificada / Comunidade)
- `pill` pequeno sem sombra. **Verificada:** fundo `accent-green` (`#DDE9C5`), texto `#3f6b34` e ícone `BadgeCheck`. **Comunidade:** fundo `accent-blue` (`#C3E9F6`), texto escuro da mesma família e ícone `Users`. Nunca depende só da cor: o texto da etiqueta sempre aparece.

### Chat por matéria (chat)
- No `AppHeader` do chat, no canto oposto ao título (à direita, antes da barra de progresso quando houver), um botão **Trocar conteúdo** (pill, `surface` com `shadow-neo-raised-sm`, ícone `BookOpen`, texto `on-surface`; só ícone no mobile). Abre um `Modal` (`size="lg"`, título **"Chat por matéria"**) com os mesmos cartões brancos de trilha do Início (nome, tópicos/módulos, barra de progresso; o escolhido ganha `border-orange`) e, ao escolher, o caminho da trilha: tocar no ▶ fecha o modal, começa uma **conversa nova** e ancora o chat naquele módulo (o `modulo_id` só é enviado na primeira mensagem). Rodapé do modal: pill laranja "Seguir sem tema" (conversa sem âncora de conteúdo). Link "Explorar mais trilhas" leva a `/explorar`.

### Explorar trilhas e Início
- **Cartão de trilha (`TrilhaExplorarCard`) e cartão de "Minhas trilhas":** **fundo branco** (`bg-white`) sobre a página `surface`, com `shadow-neo-raised`, como os cartões do seletor de trilha do chat. É a exceção documentada à regra "sem `bg-white`" dos Cards: em listagens de trilhas o branco separa o cartão do fundo. Nome em H2, autor em `body-sm` (só da comunidade), badge de origem e três metadados com ícone (temas/módulos, alunos, votos). Quando o aluno já a estuda, mostra o selo "Estudando" em `tertiary`. O mesmo vale para os cartões de matéria de `/progresso`.
- **Grade:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, como a de `/progresso`; estados de carregando, vazio e erro iguais aos de `/progresso`. Ao trocar de filtro a lista anterior continua visível (levemente esmaecida) até a nova chegar, sem piscar.
- **Ações da trilha (Explorar e Início ↔ Chat):** clicar num cartão do Explorar abre o detalhe; nele a ação principal é **Conversar** (pill `primary`, abre `/chat?trilha=<id>` com a trilha já escolhida) quando o aluno estuda a trilha, ou **Adicionar aos estudos** (mesmo botão primário) quando ainda não. Em "Minhas trilhas" do Início cada cartão tem o botão **Conversar** no rodapé (não navega para `/progresso`). O seletor de trilha do chat leva de volta ao Explorar por um link "Explorar mais trilhas".
- **Cota de criação:** texto `body-sm` "X de 3 trilhas criadas este mês", barra fina `primary` e, ao esgotar, o botão "Criar trilha" fica desabilitado com a data de renovação. O modal de criação (nome, descrição e primeiro tema) abre a partir desse botão.
- **Verificação de trilha repetida (modal "Criar trilha"):** ao enviar, o modal troca o formulário por uma etapa de decisão antes de gastar a cota. Texto `body-sm` explicando ("Já existe uma trilha igual a esta" quando é ≥95% igual; "Encontramos trilhas parecidas" entre 70% e 95%), seguido de uma **lista de até 3 linhas** (`TrilhaSimilaresLista`): cada linha é um cartão branco `rounded.md` com `shadow-neo-raised-sm`, nome em `font-display`, `TrilhaOrigemBadge`, metadados (tópicos · módulos · alunos), a porcentagem "NN% parecida" em `on-surface-muted` e o botão pill **Usar esta trilha** (`primary`; adiciona aos estudos e abre o chat, sem gastar crédito). Abaixo da lista, separado por `border-t` em `line`, o botão secundário **Criar mesmo assim (gasta 1 crédito)**, mais o **Voltar** para editar. O título que a IA corrigiu é mostrado como "Vamos criar como: <título>". Se a verificação falhar, a criação segue sem a etapa.
- **Início (`/inicio`):** primeira tela após o login; um único destaque "Explorar trilhas" (ação primária laranja), o banner "Continuar estudando" e a grade "Minhas trilhas", cada uma com **Conversar**. O chat segue em `/chat` e fica a um clique de qualquer trilha.
- **Progresso por matéria (Início e `/progresso`):** a `%` da matéria nos cartões, no anel/barra e no banner "Continuar estudando" é o **progresso geral por módulos** (módulos concluídos ÷ total de módulos), não por temas fechados — o `percentual_completo` que vem do backend só sobe quando um tema inteiro fecha e ficaria em 0% durante o primeiro tema. O valor é recalculado no cliente (`comProgressoPorModulos`, em `lib/progresso.ts`) para todos os consumidores do `/progresso`. A `%` de cada **tema** continua sendo a dos módulos daquele tema.
- **Tip de recomendação do próximo estudo (Início):** card logo **acima dos cartões de "Minhas trilhas"**, abaixo do banner "Continuar estudando", alimentado pela `GET /recomendacao`. Lista até **3 módulos a estudar**, do mais urgente para o menos (temas fracos, conteúdo novo e revisões vencidas), com fundo `bg-white` + `shadow-neo-raised` (mesma exceção dos cartões de trilha): rótulo `label-caps` "Sugestões para você" com ícone `Sparkles` e, por linha separada por `divide-line`, o número da prioridade, o ícone da matéria (`SubjectIconBadge`), o título do módulo em H2, a linha `matéria · tema · último estudo`, um selo de motivo sem sombra — **Novo conteúdo** (`accent-blue`), **Para reforçar** (`primary` a 10%) e **Revisão** (`accent-green`) — e a justificativa em `body-sm`. Cada linha tem a ação **Estudar** (pill `primary`), que abre a leitura do módulo na apostila (`/apostilas/{materiaId}?modulo={moduloId}`). **Só aparece quando o aluno já estudou algum módulo** (concluído ou com tentativa) — o `percentual_completo` da matéria não serve de sinal, pois só conta temas concluídos; para quem acabou de acessar a plataforma (nenhum módulo estudado), ou quando não há sugestão, o tip não é exibido.

### Painel de Materiais (SupportMaterials)
- Painel direito em `surface` com relevo próprio; zona de upload como área **afundada** (`shadow-neo-inset`, borda tracejada discreta) que responde ao `hover` com o laranja.

### Telas de autenticação (Login / Cadastro)
- Split 45/55: painel de marketing escuro (`#0E0E0E` + fundo neural animado) à esquerda, formulário à direita.
- Painel escuro usa Neumimalist "dark" sutil; card de imagem com `rounded.lg` e sombra profunda.
- Lado do formulário: fundo `surface`; inputs `inset`; botão submit `primary-light` + `shadow-neo-raised`; cards de apoio (`inset`/`raised` conforme o papel).
- **Consentimento (LGPD):** abaixo do campo de senha, um checkbox obrigatório "Li e aceito os Termos de Uso e a Política de Privacidade" (`accent-orange`), com os nomes dos documentos como links em `primary`. É validado pelo formulário; o erro aparece no toast, como os demais campos.

### Páginas legais (Termos / Privacidade)
Rotas públicas **`/termos`** e **`/privacidade`** (não exigem login; fora de `PRIVATE_ROUTES`). Documentam os Termos de Uso e a Política de Privacidade.

- **Shell (`LegalLayout`):** página centralizada sobre `surface`, com logo + "CHATin", link "← Voltar para o login" (`/`, `on-surface-muted`) e H1 em `font-display` (`32px`). Abaixo do título, "Última atualização: {data}" em `body-sm`/`muted`.
- **Corpo:** um único container de "documento" em `bg-white`, `rounded.lg` e `shadow-neo-raised`, `max-w-3xl`. A tipografia interna é definida por classes no wrapper (não em cada seção): `h2` em `font-display` (`18px`, `mt-8`), parágrafos/listas em `15px`/`leading-7` com `on-surface-muted`, `strong` em `on-surface`, links em `primary` com sublinhado no hover. O conteúdo é semântico (`h2`/`p`/`ul`), sem lib de Markdown.
- **Aba Privacidade (perfil):** a `ProfilePage` ganha a aba **Privacidade** (sempre visível, entre Segurança e Usuários), com o `PrivacySection`: card `bg-white`/`border-line` (`rounded.lg`) listando os direitos do titular (art. 18 da LGPD), o canal de contato (GitHub) e o link para `/privacidade`. Puramente informativo — sem ação destrutiva.

### Gráficos
- Linha/área usando `primary` com preenchimento em opacidade baixa (~15–20%) abaixo da linha. Grid discreto em tom mais claro que `surface`. Eixos em `body-sm` / `on-surface-muted`.

---

> Este arquivo segue o formato [DESIGN.md](https://github.com/google-labs-code/design.md). Os valores acima são a fonte única de verdade da identidade visual — ao criar novas telas, use estes tokens em vez de valores ad hoc. Se uma tela exigir um token que não existe aqui (nova cor, novo componente), **atualize este arquivo primeiro** (em um commit `DOCS`) e só depois implemente a tela usando o novo token.
