# CHATin Front-end

Interface inicial do CHATin, construída para as tasks CH-5 (tela para digitar o tema) e CH-36 (menu navegável). O projeto usa Next.js, TypeScript, Tailwind CSS, Lucide e as fontes Poppins + Source Sans Pro.

## Requisitos

- Node.js 20.9 ou superior
- npm 10 ou superior

## Instalação

Dentro desta pasta (`chatin-front`), instale as dependências:

```bash
npm install
```

## Desenvolvimento

Inicie o servidor local:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Validação

Para verificar o projeto antes de publicar:

```bash
npm run lint
npm run build
```

## Organização

```text
src/
	app/                         # rotas do App Router
		chat/                      # chat inicial
		biblioteca/                # página de biblioteca
		quiz/                      # página de questionários
		progresso/                 # página de progresso
		config/                    # página de configurações
	components/chat_components/  # componentes exclusivos do módulo de chat
	components/layout_components/ # componentes compartilhados de layout
	components/sidenav_components/ # menu lateral e navegação
	components/page_components/  # estados base de páginas
	hooks/use_chat.ts             # estado e ações locais do chat
	interfaces/chat_interfaces.ts # contratos TypeScript do módulo
public/                         # imagens e arquivos estáticos
```

As rotas disponíveis são `/chat`, `/biblioteca`, `/quiz`, `/progresso` e `/config`. A raiz `/` redireciona para `/chat`.

Os próximos módulos devem seguir o mesmo padrão em `snake_case`, por exemplo `questionario_components`, `use_questionario.ts` e `questionario_interfaces.ts`.
