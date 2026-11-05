/* Amorim Abraão Advogados — interações */

/* ===== EDITAR: CONFIGURAÇÃO (único lugar a trocar) =====
   WHATSAPP_NUMBER: somente números, DDI 55 + DDD + número (ex.: '5521999998888').
     Quando preenchido, os botões abrem o WhatsApp direto com a mensagem abaixo.
     Enquanto estiver vazio, usa o link curto WHATSAPP_LINK. */
const WHATSAPP_NUMBER = '5521994477404';
const WHATSAPP_LINK = 'https://whats.link/amorimabraao';
const WHATSAPP_MESSAGE = 'Olá! Vim pelo site da Amorim Abraão Advogados e gostaria de agendar uma consulta.';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* WhatsApp */
const waNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
const waUrl = waNumber
  ? `https://wa.me/${waNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  : WHATSAPP_LINK;
document.querySelectorAll('[data-whatsapp]').forEach((a) => {
  a.href = waUrl;
  a.target = '_blank';
  a.rel = 'noopener';
});
if (waNumber) {
  const local = waNumber.replace(/^55/, '');
  const label = `(${local.slice(0, 2)}) ${local.slice(2, -4)}-${local.slice(-4)}`;
  document.querySelectorAll('[data-whatsapp-label]').forEach((el) => { el.textContent = label; });
}

/* Ano no rodapé */
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* Revisão de conteúdo: abra a página com #editar para destacar o que falta preencher */
if (location.hash === '#editar') document.documentElement.classList.add('show-edit');

/* Header + botão flutuante */
const header = document.querySelector('[data-header]');
const waFloat = document.querySelector('.wa-float');
const hero = document.querySelector('.hero, .page-hero');
const onScroll = () => {
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 16);
  waFloat?.classList.toggle('is-visible', !hero || y > hero.offsetHeight * 0.6);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* Menu mobile */
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const setMenu = (open) => {
  document.body.classList.toggle('menu-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
};
toggle?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); toggle?.focus(); }
});
window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* Link ativo no menu */
const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
const sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && sections.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
}

/* Animações de entrada */
const reveals = document.querySelectorAll('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  reveals.forEach((el) => io.observe(el));
}

/* Modais das áreas de atuação (<dialog> nativo: foco e Esc já tratados pelo navegador) */
let lastTrigger = null;
document.querySelectorAll('[data-open]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dlg = document.getElementById(btn.dataset.open);
    if (!dlg?.showModal) return;
    lastTrigger = btn;
    dlg.showModal();
    document.body.classList.add('modal-open');
  });
});
document.querySelectorAll('dialog.modal').forEach((dlg) => {
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  dlg.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    lastTrigger?.focus();
  });
});

/* Notícias do STF e do STJ (via /api/noticias) */
const courtLists = document.querySelectorAll('[data-court]');
if (courtLists.length) {
  const COURT_URLS = { stf: 'https://noticias.stf.jus.br/', stj: 'https://www.stj.jus.br/sites/portalp/Comunicacao/Ultimas-noticias' };
  const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const render = (ul, items, court) => {
    ul.setAttribute('aria-busy', 'false');
    ul.replaceChildren();
    if (!items?.length) {
      const li = document.createElement('li');
      li.className = 'court-empty';
      const link = document.createElement('a');
      link.href = COURT_URLS[court];
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = `Acesse o portal do ${court.toUpperCase()}`;
      li.append('As notícias não estão disponíveis no momento. ', link);
      ul.append(li);
      return;
    }
    items.forEach((it) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = it.link;
      a.target = '_blank';
      a.rel = 'noopener';
      if (it.date) {
        const t = document.createElement('time');
        t.dateTime = it.date;
        t.textContent = fmt.format(new Date(it.date)).replace(/\./g, '').replace(/ de /g, ' ');
        a.append(t);
      }
      const s = document.createElement('span');
      s.textContent = it.title;
      a.append(s);
      li.append(a);
      ul.append(li);
    });
  };
  /* Plano B no navegador: o firewall do STJ bloqueia servidores em nuvem, mas o RSS dele
     libera CORS. Se a API vier sem STJ, o próprio navegador do visitante lê o feed. */
  const STJ_RSS = 'https://res.stj.jus.br/hrestp-c-portalp/RSS.xml';
  const PT_MONTHS = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
  const parseStjDate = (s = '') => {
    const m = s.match(/([a-zç]{3})\w*\s+(\d{1,2})\s+(\d{4})\s+(\d{2}):(\d{2})/i);
    if (!m || PT_MONTHS[m[1].toLowerCase()] === undefined) return null;
    return new Date(Date.UTC(+m[3], PT_MONTHS[m[1].toLowerCase()], +m[2], +m[4] + 3, +m[5])).toISOString();
  };
  const fetchStjInBrowser = async () => {
    const r = await fetch(STJ_RSS);
    if (!r.ok) throw new Error(r.status);
    const doc = new DOMParser().parseFromString(await r.text(), 'text/xml');
    return [...doc.querySelectorAll('item')]
      .map((it) => ({
        title: it.querySelector('title')?.textContent.trim(),
        link: it.querySelector('link')?.textContent.trim(),
        date: parseStjDate(it.querySelector('pubDate')?.textContent),
      }))
      .filter((it) => it.title && /^https:\/\/[\w.-]*stj\.jus\.br\//.test(it.link || ''))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 5);
  };

  const CACHE_KEY = 'aa-noticias';
  const readCache = () => {
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      return c && Date.now() - c.at < 30 * 60 * 1000 && c.stf?.length && c.stj?.length ? c : null;
    } catch { return null; }
  };
  const writeCache = (d) => { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...d, at: Date.now() })); } catch { /* ignore */ } };

  const LAST_GOOD_TTL = 14 * 24 * 60 * 60 * 1000;
  const saveLastGood = (k, items) => { try { localStorage.setItem(`aa-noticias-${k}`, JSON.stringify({ at: Date.now(), items })); } catch { /* ignore */ } };
  const readLastGood = (k) => {
    try {
      const c = JSON.parse(localStorage.getItem(`aa-noticias-${k}`));
      return c && Date.now() - c.at < LAST_GOOD_TTL && Array.isArray(c.items) ? c.items : [];
    } catch { return []; }
  };

  const loadNews = async () => {
    let data = readCache();
    if (!data) {
      data = await fetch('/api/noticias').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
      if (!data.stj?.length) data.stj = await fetchStjInBrowser().catch(() => []);
      if (data.stf?.length && data.stj?.length) writeCache(data);
    }
    /* Se um tribunal vier vazio (o feed do STJ às vezes é publicado sem itens),
       mostra a última lista boa que este navegador já recebeu, de até 14 dias. */
    ['stf', 'stj'].forEach((k) => {
      if (data[k]?.length) saveLastGood(k, data[k]);
      else data[k] = readLastGood(k);
    });
    courtLists.forEach((ul) => render(ul, data[ul.dataset.court], ul.dataset.court));
  };

  /* Busca quando a seção se aproxima da tela ou, no máximo, 4 s após o carregamento da página */
  let started = false;
  const start = () => { if (!started) { started = true; loadNews(); } };
  const newsSection = document.querySelector('[data-courts]');
  if ('IntersectionObserver' in window && newsSection) {
    const nio = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { nio.disconnect(); start(); }
    }, { rootMargin: '600px 0px' });
    nio.observe(newsSection);
  }
  const later = () => setTimeout(start, 4000);
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
}

/* Cookies (LGPD) + mapa sob consentimento */
const CONSENT_KEY = 'aa-consent';
const MAP_SRC = 'https://www.google.com/maps?q=Edif%C3%ADcio+Rodolpho+de+Paoli,+Av.+Nilo+Pe%C3%A7anha,+50,+Centro,+Rio+de+Janeiro+-+RJ,+20020-906&output=embed';
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
const saveConsent = (v) => { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* navegação privada */ } };

const mapBox = document.querySelector('[data-map]');
const loadMap = () => {
  if (!mapBox || mapBox.classList.contains('is-loaded')) return;
  const f = document.createElement('iframe');
  f.src = MAP_SRC;
  f.title = 'Mapa: Av. Nilo Peçanha, 50, Centro, Rio de Janeiro';
  f.loading = 'lazy';
  f.referrerPolicy = 'no-referrer-when-downgrade';
  mapBox.appendChild(f);
  mapBox.classList.add('is-loaded');
};
document.querySelector('[data-map-load]')?.addEventListener('click', loadMap);

const banner = document.querySelector('[data-cookie]');
const consent = readConsent();
if (consent === 'all') loadMap();
if (banner && !consent) banner.hidden = false;
document.querySelectorAll('[data-cookie-choice]').forEach((b) => {
  b.addEventListener('click', () => {
    const v = b.dataset.cookieChoice;
    saveConsent(v);
    banner.hidden = true;
    if (v === 'all') loadMap();
  });
});
document.querySelectorAll('[data-cookie-settings]').forEach((b) => {
  b.addEventListener('click', () => { if (banner) { banner.hidden = false; banner.querySelector('button')?.focus(); } });
});
