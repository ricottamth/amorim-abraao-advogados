# Amorim Abraão Advogados — site institucional

Site estático (HTML + CSS + JS, sem build) com uma função serverless para as notícias do STF/STJ.
Para rodar localmente (Node 18+):

```bash
node dev-server.js
```

Abra http://127.0.0.1:5540. Na Vercel, `api/noticias.js` vira automaticamente o endpoint `/api/noticias`.

## Notícias do STF e do STJ

`api/noticias.js` lê os RSS oficiais e devolve as 5 últimas de cada tribunal (cache de 30 min na CDN):

- STF: https://noticias.stf.jus.br/feed/?post_type=postsnoticias
- STJ: https://res.stj.jus.br/hrestp-c-portalp/RSS.xml

O firewall do STJ bloqueia servidores em nuvem (Vercel), então, quando a API volta sem notícias do STJ,
o navegador do visitante lê o RSS do STJ diretamente (o feed libera CORS). Se ainda assim falhar,
o site mostra um link para o portal do tribunal. As notícias só são buscadas quando a seção se aproxima da tela
e ficam 30 min em cache na sessão. Para mudar a quantidade, altere `LIMIT`.

## Estrutura

- `index.html`: one page (Header, Hero, O Escritório + selos, 4 Áreas de atuação com modais, Imprensa, Compromissos, Notícias, faixa de CTA, Contato com mapa, Footer)
- `politica-de-privacidade.html`, `termos-de-uso.html`: páginas legais (texto-base, revisar)
- `assets/js/main.js`: **configuração no topo** (WhatsApp)
- `assets/img/`: `logo.png`, `logoNegativo.png`, favicon, OG image e fotos em webp

## Pendências ([PREENCHER] / [CONFIRMAR])

Abra `index.html#editar` no navegador para destacar os campos pendentes.

| Item | Onde |
|---|---|
| Nota do Google (5,0 · 22 avaliações) é fixa: atualizar quando mudar | `index.html`, seção Contato |
| Nomenclatura do selo INPI ("Propriedade Industrial" x "Intelectual") | `index.html`, seção O Escritório |
| E-mail do encarregado de dados (DPO) | Política de Privacidade |
| Data de publicação das páginas legais | Política e Termos |
| Foto de fundo da faixa de CTA (Corcovado) | salvar como `assets/img/corcovado.webp` |
| Sócios (nome, OAB, foto, currículo): seção Equipe só se enviados | — |
| Logo em alta resolução / SVG (o atual tem 300 px) | `assets/img/logo.png` |

## Regras da OAB (Provimento 205/2021)

Os textos foram escritos para serem informativos: sem promessa de resultado, preços, superlativos,
citação de clientes ou depoimentos. Mantenha esse padrão em qualquer conteúdo novo.
