# Amorim Abraão Advogados — site institucional

Site institucional do escritório **Amorim Abraão Advogados** (Rio de Janeiro), no ar em
**[www.amorimabraao.com.br](https://www.amorimabraao.com.br)**.

Página única, leve e responsiva, feita com HTML, CSS e JavaScript puros (sem framework e sem etapa de build),
publicada na Vercel com uma função serverless para as notícias dos tribunais.

## Destaques

- **Notícias do STF e do STJ em tempo real**, lidas dos RSS oficiais, com cache e plano B no navegador
- **Publicidade conforme a OAB** (Provimento 205/2021): textos informativos, sem promessas, preços ou superlativos
- **LGPD**: banner de cookies e mapa do Google carregado somente com consentimento
- **Acessibilidade**: HTML semântico, navegação por teclado, contraste AA, `prefers-reduced-motion`
- **SEO**: dados estruturados `LegalService`, Open Graph, sitemap e redirecionamento das URLs do site antigo
- **Segurança**: Content-Security-Policy, HSTS, `nosniff`, `X-Frame-Options` e `Permissions-Policy`
- **Desempenho**: imagens WebP com dimensões fixas, sem bibliotecas externas, ~12 KB de HTML/CSS/JS comprimidos

## Como rodar localmente

Requer Node 18 ou superior.

```bash
node dev-server.js
```

Abra http://127.0.0.1:5540. O servidor local entrega os arquivos estáticos e a rota `/api/noticias`;
na Vercel, `api/noticias.js` vira esse endpoint automaticamente.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `index.html` | Página única: topo, O Escritório, Áreas de atuação (com detalhes em modal), Imprensa, Compromissos, Notícias, Contato e rodapé |
| `politica-de-privacidade.html`, `termos-de-uso.html` | Páginas legais |
| `assets/css/styles.css` | Estilos (paleta grafite e dourado extraída do logo) |
| `assets/js/main.js` | Interações; **configuração no topo** (número do WhatsApp e mensagem) |
| `api/noticias.js` | Função serverless que lê os RSS do STF e do STJ |
| `vercel.json` | Cabeçalhos de segurança, cache, região da função e redirecionamentos |
| `dev-server.js` | Servidor para desenvolvimento local (não é publicado) |

## Notícias do STF e do STJ

`api/noticias.js` lê os RSS oficiais e devolve as 5 últimas notícias de cada tribunal, com cache de 30 minutos na CDN:

- STF: https://noticias.stf.jus.br/feed/?post_type=postsnoticias
- STJ: https://res.stj.jus.br/hrestp-c-portalp/RSS.xml

O firewall do STJ recusa conexões de servidores em nuvem. Quando a API volta sem notícias do STJ, o navegador do
visitante lê o RSS diretamente (o feed libera CORS). Se o feed vier vazio, o site mostra a última lista recebida
(até 14 dias, em `localStorage`) ou, por fim, um link para o portal do tribunal. As notícias só são buscadas
quando a seção se aproxima da tela.

## Cache

Imagens ficam 7 dias em cache; CSS e JS são revalidados a cada visita. Ao trocar um arquivo mantendo o nome,
acrescente ou aumente o `?v=N` na referência (HTML ou CSS).

## Manutenção

- A nota do Google (5,0 · 22 avaliações), na seção Contato, é fixa: atualize quando mudar.
- Novos textos devem seguir o Provimento 205/2021 da OAB: conteúdo informativo, sem promessa de resultado,
  preços, superlativos, citação de clientes ou depoimentos.

## Direitos

O código está disponível para consulta como referência de trabalho. Os textos, a marca, o logotipo e as
fotografias pertencem a **Amorim Abraão Advogados** e não podem ser reutilizados sem autorização.
