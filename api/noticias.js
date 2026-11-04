/* Função serverless (Vercel): últimas notícias do STF e do STJ a partir dos RSS oficiais.
   GET /api/noticias -> { stf: [...], stj: [...], updated: ISO }
   Cada item: { title, link, date (ISO ou null) }
   Cache: memória da instância (15 min) + CDN da Vercel (s-maxage 30 min). */

const FEEDS = {
  stf: 'https://noticias.stf.jus.br/feed/?post_type=postsnoticias',
  stj: 'https://res.stj.jus.br/hrestp-c-portalp/RSS.xml',
};
const LIMIT = 5;
const MEMORY_TTL = 15 * 60 * 1000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const MONTHS = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

/* Aceita RFC 822 ("Wed, 04 Nov 2026 11:29:47 +0000") e o formato do STJ ("Qua, nov 4 2026 13:26:00", horário de Brasília) */
const parseDate = (raw) => {
  if (!raw) return null;
  const s = raw.trim();
  const pt = s.match(/^\w+,\s*([a-zç]{3})\w*\s+(\d{1,2})\s+(\d{4})\s+(\d{2}):(\d{2})/i);
  if (pt && MONTHS[pt[1].toLowerCase()] !== undefined) {
    const [, mon, d, y, h, m] = pt;
    return new Date(Date.UTC(+y, MONTHS[mon.toLowerCase()], +d, +h + 3, +m)).toISOString();
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
};

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

const parseRss = (xml) => xml
  .split(/<item[\s>]/i)
  .slice(1)
  .map((block) => ({
    title: tag(block, 'title'),
    link: tag(block, 'link'),
    date: parseDate(tag(block, 'pubDate')),
  }))
  .filter((it) => it.title && /^https:\/\/[\w.-]*(stf|stj)\.jus\.br\//.test(it.link))
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  .slice(0, LIMIT);

const fetchFeed = async (url) => {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*', 'Accept-Language': 'pt-BR,pt;q=0.9' },
    signal: AbortSignal.timeout(9000),
  });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return parseRss(await r.text());
};

let memo = null; // { at, data }

const getNews = async () => {
  if (memo && Date.now() - memo.at < MEMORY_TTL) return memo.data;
  const keys = Object.keys(FEEDS);
  const results = await Promise.allSettled(keys.map((k) => fetchFeed(FEEDS[k])));
  const data = { updated: new Date().toISOString() };
  results.forEach((res, i) => {
    const k = keys[i];
    // Se um feed falhar, mantém a última versão boa daquele tribunal
    data[k] = res.status === 'fulfilled' && res.value.length ? res.value : (memo?.data[k] || []);
    if (res.status === 'rejected') console.error('[noticias]', res.reason?.message);
  });
  if (data.stf.length || data.stj.length) memo = { at: Date.now(), data };
  return data;
};

module.exports = async (req, res) => {
  try {
    const data = await getNews();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error('[noticias]', err);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ stf: [], stj: [], error: 'unavailable' }));
  }
};
module.exports.parseRss = parseRss;
module.exports.parseDate = parseDate;
