# cub4Studio AI

Funil para o empresário montar um preview com a cub4Studio: tutorial, formulário, chat e resultado completo. No fim, um modal abre WhatsApp e Instagram com o briefing.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Requer Node 20.9 ou superior (Next 16).

Os projetos ficam no navegador. A página `/conta` apaga esse armazenamento local.

## Marca e home

- `src/components/Logo.tsx`: símbolo (cubo isométrico) e nome. `src/app/icon.svg` é o favicon com a mesma marca.
- `src/lib/showcase.ts`: as ideias de projeto exibidas nas colunas da home. Cada card abre `/criar?produto=<formato>` com o formato pré-selecionado.
- `src/app/globals.css`: tokens de cor (`brand`, `gold`, `ink`, `cream`, `sand`, `mute`) e animações. Respeita `prefers-reduced-motion`.

## Verificar

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Integrações

O passo a passo de IA, Mercado Pago, Nubank, Turnstile, auth e banco está em [docs/integracoes.md](docs/integracoes.md). Copie [.env.example](.env.example). Não commite segredos.

Com `AI_GENERATION_ENABLED=false`, a geração usa o compositor local e não chama provedor pago.
