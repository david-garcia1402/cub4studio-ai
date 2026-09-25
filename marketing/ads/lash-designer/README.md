# Criativo em vídeo — cub4Studio | nicho Lash Designer

Anúncio vertical (1080x1920, 9:16, 30 fps, ~33,5 s) para Reels, Stories, TikTok e
Facebook Reels, montado sobre a gravação de tela real do site de uma Lash Designer.

`render_ad.py` gera o vídeo completo (imagem + trilha + sound design) e as três
versões de teste A/B, que diferem apenas no hook (0:00–0:03.5):

| Versão | Hook |
| --- | --- |
| A — dor | Você é Lash Designer? Ainda manda suas clientes procurar tudo no Instagram? |
| B — curiosidade | Olha o que desenvolvemos para uma Lash Designer… |
| C — aspiração | Seu trabalho é profissional. Sua presença online também parece? |

## Como gerar

```bash
pip install pillow numpy scipy   # ffmpeg precisa estar no PATH
python3 render_ad.py --recording gravacao_do_site.mp4 --out ./out
```

Saída: `out/cub4studio_lash_designer_vA.mp4`, `_vB.mp4`, `_vC.mp4`.
A fonte Inter é baixada automaticamente na primeira execução. A trilha e os
efeitos sonoros são sintetizados no próprio script (sem material de terceiros).

## Estrutura do roteiro

| Tempo | Cena |
| --- | --- |
| 0:00–0:03.5 | Hook (varia por versão) |
| 0:03.5–0:04.8 | "Veja como poderia ser 👇" |
| 0:04.8–0:07.6 | Hero do site — "Sua marca com cara de marca." |
| 0:07.6–0:11.4 | Apresentação da profissional — "Sua apresentação profissional." |
| 0:11.4–0:13.8 | Diferenciais — "Seus diferenciais em destaque." |
| 0:13.8–0:15.8 | Menu — "Tudo em um único lugar." |
| 0:15.8–0:17.8 | Catálogo — "Seus procedimentos organizados." |
| 0:17.8–0:20.4 | Cards + botões — "A cliente conhece. Escolhe. E chama para agendar." + selo "Agendamento direto pelo WhatsApp" |
| 0:20.4–0:23.4 | Close no procedimento — "Seu trabalho já é profissional. Sua presença online também deveria ser." |
| 0:23.4–0:27.4 | cub4Studio · Sites que geram resultados · Seu site profissional · R$ 399,90 · ~~De R$ 799,00~~ · 12x com taxa* |
| 0:27.4–0:30.2 | "Quer um site assim para o seu negócio?" |
| 0:30.2–0:33.5 | CTA: @cub4studio · WhatsApp (47) 99994-3099 · "FALE COM A CUB4STUDIO" · rodapé do parcelamento |

A gravação é usada de forma contínua (sem cortes que quebrem a navegação); apenas
o ritmo é ajustado por trecho e são aplicados zooms suaves. Os textos foram
alinhados ao que realmente aparece na tela — por isso a cena da apresentação da
profissional recebeu "Sua apresentação profissional." em vez de
"Seus procedimentos organizados.", que foi movido para o catálogo.

Para ajustar tempos, trechos ou textos, edite `SITE_SEGMENTS`, `CAPTIONS` e
`HOOKS` no topo do script.
