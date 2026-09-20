---
name: CHATin
colors:
  primary: "#F2711C"
  primary-light: "#FF7A1A"
  secondary: "#222222"
  tertiary: "#5CA382"
  neutral: "#EFEDE9"
  surface: "#EFEDE9"
  on-surface: "#222222"
  on-surface-muted: "#6B6B6B"
  error: "#F26753"
  sidebar: "#FDF0DB"
  sidebar-ink: "#8A5A2B"
  sidebar-active: "#B45309"
  line: "#E2DED6"
  accent-blue: "#C3E9F6"
  accent-green: "#DDE9C5"
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

A **sidebar de navegação é laranja claro (pêssego)** — uma clarificação do antigo rail escuro, criando uma faixa quente e acolhedora à esquerda, alinhada ao acento laranja da marca. O acento laranja continua reservado para ações primárias, progresso e o item ativo da navegação.

Evitar gradientes pesados, ilustrações 3D exageradas, excesso de cor e **relevos dramáticos** (sombras muito longas/opacas quebram a leitura de "limpo"). O Neumimalist aqui é a forma de elevação do sistema, não o tema inteiro.

## Colors

- **Primary (`#F2711C`):** laranja quente. Usado em botões primários (CTA), ícone ativo da sidebar, barra de progresso, badges de XP/streak. É a única cor "forte" da interface — usar com moderação, nunca como fundo de tela inteira.
- **Primary-light (`#FF7A1A`):** laranja de apoio, um passo mais vivo que o primary. Usado em botões preenchidos e bolhas do usuário no chat, onde o primary ficaria pesado.
- **Secondary (`#222222`):** quase-preto. Cor do texto principal e do painel de marketing da tela de login. Não é mais usado como fundo de sidebar.
- **Sidebar (`#F2711C`):** o próprio laranja `primary`, sólido e sem relevo. Fundo da navegação lateral — é a única superfície da interface que usa a cor de acento como fundo cheio (exceção deliberada à regra de "usar com moderação", porque é uma faixa fixa e estreita, não uma tela de conteúdo).
- **Sidebar-ink (`#FFFFFF`):** branco. Cor dos ícones inativos sobre o laranja, a ~85% de opacidade.
- **Sidebar-active (`#F2711C`):** o próprio laranja, usado como cor do ícone quando o item está sobre fundo branco (estado ativo/hover — ver Sidebar em Components).
- **Tertiary (`#5CA382`):** verde. Usado em badges de status positivo (ex.: "Finalizado").
- **Neutral (`#EFEDE9`):** fundo geral das páginas **e** cor padrão dos cards. Por definição do Neumimalist, página e card compartilham a mesma cor — a separação vem do relevo.
- **Surface (`#EFEDE9`):** mesma cor do neutral. Cards, inputs (via inset) e painéis usam `surface`; não existe mais "card branco sobre fundo cinza".
- **Line (`#E2DED6`):** hairlines excepcionais (ex.: divisores internos, contorno de foco acessível). Borders de card/botão saíram de cena — o relevo é o contorno.
- **On-surface (`#222222`):** texto principal sobre fundo claro.
- **On-surface-muted (`#6B6B6B`):** texto secundário, legendas, timestamps.
- **Error/Alerta (`#F26753`):** usado também no badge de streak (contexto motivacional, não só erro — mas reservar tons de vermelho/coral para estados de atenção/urgência).
- **Accent-blue (`#C3E9F6`) / Accent-green (`#DDE9C5`):** cores de apoio para tags de categoria (ex.: matéria/tópico) na Biblioteca de Resumos. Usar em rotação para diferenciar categorias, nunca com significado fixo (não são "sucesso" ou "erro").

## Typography

- **Display/headings: Poppins** (`font-display`) — usada em títulos de página e de card.
- **Texto/interface: Source Sans 3** (`font-sans`, padrão do `body`).
- Apenas dois pesos por família: `400` (texto) e `600/700` (títulos/ênfase) — evitar mais variações.

- **H1:** títulos de página e de telas de auth (ex.: "Acessar conta", "Biblioteca de Resumos"). Sempre acompanhado de um subtítulo em `body-md` com `on-surface-muted`.
- **H2:** títulos de card/seção.
- **Body-md:** texto de interface padrão (mensagens do chat, descrições).
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

A sidebar é a única superfície da interface **sem nenhum relevo** — fundo laranja sólido, ícones brancos, e o estado ativo/hover é só inversão de cor (fundo branco + ícone laranja), nunca sombra.

Regras de uso:
- **Um relevo por elemento.** Não empilhar `raised` + borda + cor de fundo diferente.
- **Minimalista primeiro, relevo depois.** É "**Neu**morfismo + **minimalista**", não neomorfismo puro — a maioria da UI fica lisa (sem sombra nenhuma); relevo é reservado pra 2-3 níveis de hierarquia (card principal, botão de ação, item ativo), nunca em toda superfície da tela.
- **Nunca em elementos pequenos.** Badges, pills de estado, tags, alternativas de múltipla escolha e outros elementos de texto curto **não levam sombra** — usam só cor de fundo (`accent-blue`, `accent-green`, tons claros de `primary`/`error`/`tertiary`) e, no máximo, um `border` de 1px em `line`. Sombra em elemento pequeno é o erro mais comum que faz a tela parecer "plástico" (neomorfismo datado) em vez de minimalista.
- **Interação:** botões usam `raised` no estado normal e `inset` no estado `active` (afundam quando pressionados); inputs já nascem `inset` e ganham anel de foco laranja.
- **Contraste:** Neumimalist reduz contraste por natureza — texto nunca fica sobre relevo sem cor; botões primários permanecem **preenchidos de laranja com texto branco**.
- **Dark Neumimalist:** no painel escuro do login (`#0E0E0E`), o mesmo princípio vale com sombras claras/escuras de baixa opacidade sobre o preto.

## Components

### Sidebar
- Fundo `sidebar` (#F2711C, laranja forte, cor sólida — **sem sombra/relevo nesta faixa**), rail estreito (52px no mobile, 64px em telas maiores).
- Ícones inativos em branco (`sidebar-ink`) a 85% de opacidade, sem fundo.
- **Hover e item ativo:** fundo branco liso (sem sombra) atrás do ícone, que vira `sidebar-active` (o laranja) — o contraste vem da inversão de cor, não de relevo.
- Avatar de perfil no rodapé, com borda branca.

### Header (AppHeader)
- Barra superior com `surface` + `shadow-neo-raised-sm`, sem `border-b`.
- Contém logo com indicador de status verde, título (`font-display`) e subtítulo em `on-surface-muted`.

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

### Painel de Materiais (SupportMaterials)
- Painel direito em `surface` com relevo próprio; zona de upload como área **afundada** (`shadow-neo-inset`, borda tracejada discreta) que responde ao `hover` com o laranja.

### Telas de autenticação (Login / Cadastro)
- Split 45/55: painel de marketing escuro (`#0E0E0E` + fundo neural animado) à esquerda, formulário à direita.
- Painel escuro usa Neumimalist "dark" sutil; card de imagem com `rounded.lg` e sombra profunda.
- Lado do formulário: fundo `surface`; inputs `inset`; botão submit `primary-light` + `shadow-neo-raised`; cards de apoio (`inset`/`raised` conforme o papel).

### Gráficos
- Linha/área usando `primary` com preenchimento em opacidade baixa (~15–20%) abaixo da linha. Grid discreto em tom mais claro que `surface`. Eixos em `body-sm` / `on-surface-muted`.

---

> Este arquivo segue o formato [DESIGN.md](https://github.com/google-labs-code/design.md). Os valores acima são a fonte única de verdade da identidade visual — ao criar novas telas, use estes tokens em vez de valores ad hoc. Se uma tela exigir um token que não existe aqui (nova cor, novo componente), **atualize este arquivo primeiro** (em um commit `DOCS`) e só depois implemente a tela usando o novo token.
