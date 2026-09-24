# Integrações externas

Nada daqui entra no Git. Copie os nomes para o ambiente da Vercel. Os valores ficam só lá.

Enquanto `AI_GENERATION_ENABLED` não for `true`, o app monta o preview no servidor com o compositor local. Visitar, preencher e abrir o projeto não chama provedor pago.

## 1. Provedor de IA

1. Crie uma chave no provedor com saída JSON.
2. Salve `AI_API_KEY` em Production e Preview, separados.
3. Defina `AI_MODEL` se quiser outro modelo. O padrão previsto é `gpt-4o-mini`.
4. Só então ligue `AI_GENERATION_ENABLED=true`.
5. A rota é `POST /api/ai/generate`. A chave não pode aparecer no browser.
6. Hoje, com a flag ligada, a rota responde 503 de propósito: o conector do provedor ainda não está plugado. Isso evita gastar sem o contrato de schema pronto.

## 2. Mercado Pago (fase futura)

1. Crie a aplicação em https://www.mercadopago.com/developers.
2. Guarde `MP_ACCESS_TOKEN` só no servidor.
3. Use Checkout Pro. O site não guarda cartão.
4. Aponte o webhook para `POST /api/billing/webhook`.
5. Valide a assinatura com `MP_WEBHOOK_SECRET`.
6. Evento repetido não pode somar crédito duas vezes.
7. A volta do browser com `?status=approved` não libera nada. Só o webhook.

Esta fase não tem tela de pagamento.

## 3. Nubank

O Nubank recebe o repasse. Ele não substitui o checkout.

1. No Mercado Pago, cadastre a conta PJ Nubank como conta de liquidação.
2. Não há integração com a API do Nubank.

## 4. Cloudflare Turnstile

1. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` pode ir ao browser.
2. `TURNSTILE_SECRET_KEY` fica no servidor e precisa ser conferida no Siteverify.
3. Use em cadastro, login e geração, quando essas telas existirem.

## 5. Auth

1. Gere `AUTH_SECRET` aleatório.
2. Cookies HttpOnly.
3. Google opcional: `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`.

## 6. Banco

1. `DATABASE_URL` de um Postgres.
2. Sem banco, o funil guarda o projeto no navegador.

## 7. Kill switch

`AI_GENERATION_ENABLED=false` impede chamada paga sem novo deploy de lógica.
