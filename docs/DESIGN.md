---
name: CHATin
colors:
  primary: "#F2711C"
  secondary: "#1E1E1E"
  tertiary: "#5CA382"
  neutral: "#FAFAFA"
  surface: "#FFFFFF"
  on-surface: "#222222"
  on-surface-muted: "#6B7280"
  error: "#F26753"
  accent-blue: "#C3E9F6"
  accent-green: "#DDE9C5"
typography:
  h1:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: Inter
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.3
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.4
  label-caps:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.06em
rounded:
  sm: 6px
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

O CHATin usa uma linguagem visual de **SaaS educacional moderno**: fundo claro e neutro, cards brancos com sombra suave, e um único acento de cor forte (laranja) reservado para ações primárias e destaques de progresso. A sidebar de navegação é escura (quase preta), criando contraste com a área de conteúdo clara — um padrão comum em ferramentas de produtividade (tipo Notion, Linear).

O tom deve transmitir foco e credibilidade — é uma ferramenta de estudo para um momento importante (vestibular/ENEM), não um app "descolado" ou infantil. Evitar gradientes pesados, ilustrações 3D exageradas ou excesso de cor.

## Colors

- **Primary (`#F2711C`):** laranja quente. Usado em botões primários (CTA), ícone ativo da sidebar, barra de progresso, badges de XP/streak. É a única cor "forte" da interface — usar com moderação, nunca como fundo de tela inteira.
- **Secondary (`#1E1E1E`):** quase-preto. Fundo da sidebar de navegação e do painel de marketing da tela de login. Contrasta com as áreas de conteúdo, que são claras.
- **Tertiary (`#5CA382`):** verde. Usado em badges de status positivo (ex.: "Finalizado").
- **Neutral (`#FAFAFA`):** fundo geral das páginas de conteúdo (atrás dos cards brancos).
- **Surface (`#FFFFFF`):** fundo dos cards, inputs e do painel de conversa.
- **On-surface (`#222222`):** texto principal sobre fundo claro.
- **On-surface-muted (`#6B7280`):** texto secundário, legendas, timestamps.
- **Error/Alerta (`#F26753`):** usado também no badge de streak (contexto motivacional, não só erro — mas reservar tons de vermelho/coral para estados de atenção/urgência).
- **Accent-blue (`#C3E9F6`) / Accent-green (`#DDE9C5`):** cores de apoio para tags de categoria (ex.: matéria/tópico) na Biblioteca de Resumos. Usar em rotação para diferenciar categorias, nunca com significado fixo (não são "sucesso" ou "erro").

## Typography

Fonte-base: **Inter** (ou sans-serif geométrica equivalente caso não esteja disponível). Apenas dois pesos: `400` (texto) e `700` (títulos/ênfase) — evitar mais variações de peso para manter consistência.

- **H1:** títulos de página (ex.: "Biblioteca de Resumos", "Meu Desempenho"). Sempre acompanhado de um subtítulo em `body-md` com `on-surface-muted`.
- **H2:** títulos de card/seção.
- **Body-md:** texto de interface padrão (mensagens do chat, descrições).
- **Body-sm:** metadados (datas, contadores).
- **Label-caps:** rótulos em caixa alta com leve espaçamento entre letras (ex.: "MÚLTIPLA ESCOLHA", "RANKING GLOBAL", "CARDS REVISADOS").

## Radius & Spacing

- **sm (6px):** inputs, tags pequenas.
- **md (12px):** cards, botões, ícones de sidebar.
- **lg (20px):** containers maiores (ex.: painel de marketing do login).
- **pill (999px):** badges (XP, streak, status), sempre com padding horizontal generoso.

Espaçamento em múltiplos de 8px (`sm`=8, `md`=16, `lg`=24, `xl`=32) — evitar valores arbitrários fora dessa escala.

## Components

### Botões
- **Primário:** fundo `primary`, texto branco, `rounded.md`, peso 700. Usado para a ação principal da tela (ex.: "Entrar na Plataforma", "Próxima Questão", "+ Novo Questionário").
- **Secundário/outline:** borda `primary`, fundo transparente, texto `primary` (ex.: "Refazer Simulado").
- **Texto/link:** sem fundo, cor `primary`, usado para ações terciárias (ex.: "Pular Questão", "Ver ranking completo").

### Badges & Tags
- Formato `pill`, fundo em tom claro da cor semântica (ex.: `#FDF0DB` para XP, `#DDE9C5`/`#C3E9F6` para categorias), texto em tom mais escuro da mesma família de cor.
- Sempre acompanhadas de um ícone pequeno quando representam uma métrica (raio para XP, fogo para streak).

### Cards
- Fundo `surface`, `rounded.md`, sombra suave (`0 1px 3px rgba(0,0,0,0.08)` aprox.), sem borda visível na maioria dos casos.
- Cards de destaque (ex.: posição do usuário no ranking) podem usar fundo levemente colorido (`#FEF8F3`) para se diferenciar sem quebrar a paleta.

### Inputs
- Fundo branco, borda cinza clara 1px, `rounded.sm`, ícone à esquerda quando aplicável (envelope, cadeado). Placeholder em `on-surface-muted`.

### Navegação lateral (Sidebar)
- Fundo `secondary` (#1E1E1E), ícones em branco/cinza claro quando inativos, e destacados com fundo `primary` (bloco laranja) quando ativos — não apenas mudança de cor do ícone, mas um bloco de fundo inteiro.

### Gráficos
- Linha/área usando `primary` com preenchimento em opacidade baixa (~15–20%) abaixo da linha. Grid discreto em cinza muito claro. Eixos em `body-sm` / `on-surface-muted`.

---

> Este arquivo segue o formato [DESIGN.md](https://github.com/google-labs-code/design.md). Os valores acima foram extraídos diretamente dos wireframes atuais do projeto (`docs/wireframe/`) — ao criar novas telas, use estes tokens em vez de novos valores ad hoc. Se uma tela exigir um token que não existe aqui (nova cor, novo componente), atualize este arquivo primeiro, depois implemente.
