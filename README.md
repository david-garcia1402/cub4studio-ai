# cub4Studio AI

Funil para o empresário montar um preview com a cub4Studio: tutorial, formulário, chat e resultado completo. No fim, um modal abre WhatsApp e Instagram com o briefing.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Os projetos ficam no navegador. A página `/conta` apaga esse armazenamento local.

## Integrações

O passo a passo de IA, Mercado Pago, Nubank, Turnstile, auth e banco está em [docs/integracoes.md](docs/integracoes.md). Copie [.env.example](.env.example). Não commite segredos.

Com `AI_GENERATION_ENABLED=false`, a geração usa o compositor local e não chama provedor pago.
