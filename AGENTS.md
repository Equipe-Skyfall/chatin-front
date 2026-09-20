# AGENTS.md

Convenções e contexto pra qualquer agente de codificação (Claude Code, Cursor, Copilot, Codex etc.) que trabalhe neste repositório vivem em dois lugares:

- [`../docs/AGENTS.md`](../docs/AGENTS.md) — convenções comuns aos dois repos do monorepo `chatin` (padrão de commit, PR, review, arquitetura geral). Leia primeiro.
- [`docs/AGENTS.md`](docs/AGENTS.md) — específico deste repo (stack do frontend, estrutura de componentes, chamadas à API, testes).
- [`docs/DESIGN.md`](docs/DESIGN.md) — identidade visual (cores, tipografia, componentes). Vive aqui porque é 100% frontend.

Este arquivo assume que você está trabalhando dentro do checkout do monorepo (`chatin/chatin-front/`), onde `../docs/` existe. Se você clonou só este repo (sem o monorepo do lado), `../docs/AGENTS.md` não vai existir — nesse caso, pelo menos `docs/AGENTS.md` e `docs/DESIGN.md` (específicos daqui) continuam válidos.
