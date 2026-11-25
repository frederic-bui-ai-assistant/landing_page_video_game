/* ==========================================================
   Lucia & Jason — logique du site
   - Charge characters.json
   - Navigation par ancres (#lucia, #jason, #histoire) sans rechargement
   - Portraits : illustrations SVG originales générées depuis le JSON
   ========================================================== */
(() => {
  'use strict';

  const DATA_URL = 'characters.json';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (sel, root = document) => root.querySelector(sel);

  let data = null;
  let currentKey = null;
  let swapTimer = null;

  /* ---------- Utilitaires DOM (tout passe par textContent) ---------- */
  function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid !== null && kid !== undefined) node.append(kid);
    }
    return node;
  }

  const safeColor = (c, fallback) => (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : fallback);

  /* ---------- Badge de statut ---------- */
  function isConfirmed(statut) {
    return String(statut || '').toLowerCase().replace('é', 'e').startsWith('confirme');
  }

  function badge(statut) {
    const ok = isConfirmed(statut);
    const l = data.legende;
    return el('span', { class: 'badge ' + (ok ? 'badge--ok' : 'badge--nok') },
      el('span', { 'aria-hidden': 'true' }, ok ? '✔' : '?'),
      ok ? l.confirme : l.nonConfirme);
  }

  /* ---------- Portraits SVG originaux ---------- */
  function portraitSVG(p, uid) {
    const bg1 = safeColor(p.fond && p.fond[0], '#2a0845');
    const bg2 = safeColor(p.fond && p.fond[1], '#c2185b');
    const skin = safeColor(p.peau, '#c98a63');
    const hair = safeColor(p.cheveux, '#1a0a2e');
    const top = safeColor(p.haut, '#ff2e97');
    const long = p.coiffure === 'longue';

    const hairBack = long
      ? `<path d="M128 245 C112 150 168 136 202 136 C246 136 292 160 274 252 L296 410 C250 385 152 385 106 410 Z" fill="${hair}"/>`
      : '';
    const hairFront = long
      ? `<path d="M136 236 C138 170 190 148 242 164 C276 176 274 216 264 240 C240 202 188 192 136 236 Z" fill="${hair}"/>`
      : `<path d="M136 234 C130 168 176 146 206 146 C248 146 276 176 264 234 C252 200 216 184 176 194 C154 200 144 214 136 234 Z" fill="${hair}"/>`;

    let accessory = '';
    if (p.accessoire === 'casque') {
      accessory = `
        <path d="M126 240 C122 140 280 140 274 240" fill="none" stroke="#fdf6ff" stroke-width="9" stroke-linecap="round"/>
        <rect x="112" y="226" width="26" height="56" rx="12" fill="#1a0033" stroke="#2de2e6" stroke-width="4"/>
        <rect x="262" y="226" width="26" height="56" rx="12" fill="#1a0033" stroke="#2de2e6" stroke-width="4"/>`;
    } else if (p.accessoire === 'lunettes') {
      accessory = `
        <rect x="146" y="238" width="48" height="30" rx="12" fill="#12002b" stroke="#ff9a3c" stroke-width="3"/>
        <rect x="206" y="238" width="48" height="30" rx="12" fill="#12002b" stroke="#ff9a3c" stroke-width="3"/>
        <rect x="192" y="248" width="16" height="5" fill="#ff9a3c"/>
        <path d="M152 246 L172 246 M212 246 L232 246" stroke="#ff2e97" stroke-width="3" stroke-linecap="round" opacity=".9"/>`;
    }

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" role="img" focusable="false">
  <defs>
    <linearGradient id="bg-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <linearGradient id="sun-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd166"/><stop offset=".5" stop-color="#ff9a3c"/><stop offset="1" stop-color="#ff2e97"/>
    </linearGradient>
    <mask id="stripes-${uid}">
      <rect width="400" height="480" fill="#fff"/>
      <rect y="250" width="400" height="5" fill="#000"/><rect y="272" width="400" height="7" fill="#000"/>
      <rect y="296" width="400" height="9" fill="#000"/><rect y="322" width="400" height="11" fill="#000"/>
    </mask>
  </defs>
  <rect width="400" height="480" fill="url(#bg-${uid})"/>
  <circle cx="200" cy="250" r="128" fill="url(#sun-${uid})" mask="url(#stripes-${uid})" opacity=".85"/>
  <g stroke="#2de2e6" stroke-opacity=".55" stroke-width="1.5" fill="none">
    <path d="M0 372 H400 M0 400 H400 M0 432 H400 M0 470 H400"/>
    <path d="M200 372 L200 480 M150 372 L40 480 M100 372 L-60 480 M250 372 L360 480 M300 372 L460 480"/>
  </g>
  <g>
    ${hairBack}
    <rect x="176" y="296" width="48" height="80" rx="16" fill="${skin}"/>
    <rect x="176" y="296" width="48" height="80" rx="16" fill="#000" opacity=".22"/>
    <path d="M30 480 C30 410 104 366 200 366 C296 366 370 410 370 480 Z" fill="${top}"/>
    <path d="M150 370 L200 420 L250 370" fill="none" stroke="#0d0221" stroke-width="10" stroke-linejoin="round" opacity=".55"/>
    <ellipse cx="200" cy="246" rx="64" ry="80" fill="${skin}"/>
    <path d="M254 190 C282 230 270 292 218 322" fill="none" stroke="#ff2e97" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    ${hairFront}
    ${accessory}
    <path d="M30 480 C30 410 104 366 200 366 C296 366 370 410 370 480" fill="none" stroke="#fdf6ff" stroke-opacity=".6" stroke-width="3"/>
  </g>
</svg>`;

    const tpl = document.createElement('template');
    tpl.innerHTML = svg.trim();
    const node = tpl.content.firstElementChild;
    node.setAttribute('aria-label', p.description || '');
    node.prepend(Object.assign(document.createElementNS('http://www.w3.org/2000/svg', 'title'), { textContent: p.description || '' }));
    return node;
  }

  /* ---------- Rendu : accueil ---------- */
  function renderHome() {
    const a = data.accueil;
    $('#accueil-kicker').textContent = a.kicker;
    $('#titre-accueil').textContent = a.titre;
    $('#accueil-intro').textContent = a.intro;
    $('#accueil-statut').textContent = a.statutJeu || '';
    $('#accueil-histoire').textContent = a.boutonHistoire;

    const list = $('#cartes');
    list.replaceChildren(...data.personnages.map((p) => {
      const art = el('div', { class: 'card__art', 'aria-hidden': 'true' });
      const svg = portraitSVG(p.portrait, 'card-' + p.id);
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('preserveAspectRatio', 'xMidYMin slice');
      svg.removeAttribute('role');
      svg.removeAttribute('aria-label');
      svg.querySelector('title')?.remove();
      art.append(svg);

      const card = el('a', {
        class: 'card',
        href: '#' + p.id,
        style: `--c1:${safeColor(p.couleurs.a, '#ff2e97')};--c2:${safeColor(p.couleurs.b, '#ff9a3c')}`
      },
        art,
        el('div', { class: 'card__body' },
          el('div', { class: 'card__num' }, `DOSSIER ${p.numero}`),
          el('div', { class: 'card__name' }, p.nom),
          el('p', { class: 'card__txt' }, p.accroche),
          el('span', { class: 'card__cta' }, `Ouvrir la fiche de ${p.nom}`, el('span', { 'aria-hidden': 'true' }, '→'))
        )
      );
      return el('li', {}, card);
    }));

    const l = data.legende;
    $('#legende').replaceChildren(
      el('p', {}, badge('confirmé'), ' ', l.confirmeAide),
      el('p', {}, badge('non confirmé'), ' ', l.nonConfirmeAide)
    );
  }

  /* ---------- Rendu : pied de page ---------- */
  function renderFooter() {
    $('#pied-avertissement').textContent = data.site.avertissement;
    $('#pied-perimetre').textContent = data.site.perimetre;
    $('#pied-verification').textContent = `Dernière vérification des informations : ${data.site.verification}.`;
    $('#sources').replaceChildren(...data.sources.map((s) =>
      el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.titre))
    ));
  }

  /* ---------- Rendu : fiche personnage ---------- */
  function factBlock(titre, items) {
    return el('div', {},
      el('h4', {}, titre),
      el('ul', { class: 'facts' }, items.map((it) =>
        el('li', {}, el('div', {}, badge(it.statut)), el('p', {}, it.texte))
      ))
    );
  }

  function renderCharacter(p) {
    const other = data.personnages.find((x) => x.id === p.suivant) || data.personnages.find((x) => x.id !== p.id);
    const section = $('#vue-fiche');
    section.style.setProperty('--c1', safeColor(p.couleurs.a, '#ff2e97'));
    section.style.setProperty('--c2', safeColor(p.couleurs.b, '#ff9a3c'));

    const portrait = el('div', { class: 'sheet__portrait' }, portraitSVG(p.portrait, 'sheet-' + p.id));

    const body = el('div', { class: 'sheet__body panel' },
      el('p', { class: 'kicker' }, `Dossier ${p.numero} · Fiche personnage`),
      el('h2', { id: 'titre-fiche', class: 'sheet__title', tabindex: '-1' }, p.nomComplet),
      el('p', { class: 'lead' }, p.accroche),
      el('div', { class: 'sheet__actions' },
        other ? el('a', { class: 'btn btn--primary', href: '#' + other.id }, `Passer à ${other.nom}`, el('span', { 'aria-hidden': 'true' }, '→')) : null,
        el('a', { class: 'btn btn--ghost', href: '#accueil' }, 'Retour à l’accueil')
      ),

      el('h3', {}, 'Son histoire'),
      factBlock('Origines', p.resume.origines),
      factBlock('Parcours', p.resume.parcours),
      factBlock('Rôle dans le jeu', p.resume.role),

      el('h3', {}, 'Traits de caractère'),
      el('p', { class: 'note' }, 'Ces traits sont une lecture des trailers et des présentations officielles, pas une liste établie par Rockstar.'),
      el('ul', { class: 'traits' }, p.traits.map((t) =>
        el('li', {}, el('strong', {}, t.nom), el('span', {}, t.description)))),

      el('h3', {}, 'Ambiance'),
      el('p', { class: 'note' }, 'Citations paraphrasées et réécrites par nos soins : ce ne sont pas des répliques du jeu.'),
      p.citations.map((c) =>
        el('figure', { class: 'quote' },
          el('blockquote', {}, el('p', {}, `« ${c.texte} »`)),
          el('figcaption', {}, c.contexte))),

      el('h3', {}, 'Ce qui reste incertain'),
      el('ul', { class: 'uncertain' }, p.incertitudes.map((t) => el('li', {}, t)))
    );

    section.replaceChildren(el('article', { class: 'sheet' }, portrait, body));
  }

  /* ---------- Rendu : histoire commune ---------- */
  function renderStory() {
    const h = data.histoireCommune;
    const section = $('#vue-histoire');
    section.style.setProperty('--c1', '#ff2e97');
    section.style.setProperty('--c2', '#ff9a3c');

    section.replaceChildren(
      el('div', { class: 'story__head panel' },
        el('p', { class: 'kicker' }, 'Lucia & Jason'),
        el('h2', { id: 'titre-histoire', class: 'sheet__title', tabindex: '-1' }, h.titre),
        el('p', { class: 'lead' }, h.intro)
      ),
      el('ol', { class: 'timeline' }, h.etapes.map((e) =>
        el('li', { class: isConfirmed(e.statut) ? '' : 'is-uncertain' },
          el('h3', {}, e.titre),
          el('div', {}, badge(e.statut)),
          el('p', {}, e.texte)))),
      el('div', { class: 'panel', style: 'margin-top:1.25rem' },
        el('h3', { style: 'margin-top:0' }, 'Ce qui reste incertain'),
        el('ul', { class: 'uncertain' }, h.incertitudes.map((t) => el('li', {}, t)))),
      el('div', { class: 'story__links' },
        ...data.personnages.map((p) => el('a', { class: 'btn btn--ghost', href: '#' + p.id }, `Fiche de ${p.nom}`)),
        el('a', { class: 'btn btn--primary', href: '#accueil' }, 'Retour à l’accueil'))
    );
  }

  /* ---------- Navigation ---------- */
  function viewFor(key) {
    if (key === 'histoire') return { id: 'vue-histoire', title: `${data.histoireCommune.titre} — ${data.site.titre}`, focus: '#titre-histoire' };
    if (key === 'accueil') return { id: 'vue-accueil', title: `${data.site.titre} — ${data.site.baseline}`, focus: '#titre-accueil' };
    const p = data.personnages.find((x) => x.id === key);
    return { id: 'vue-fiche', title: `${p.nomComplet} — ${data.site.titre}`, focus: '#titre-fiche' };
  }

  function updateNav(key) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function route() {
    const raw = decodeURIComponent((location.hash || '#accueil').slice(1));
    const valid = raw === 'accueil' || raw === 'histoire' || data.personnages.some((p) => p.id === raw);
    show(valid ? raw : 'accueil');
  }

  function show(key) {
    if (key === currentKey) return;
    const isFirst = currentKey === null;
    const previous = document.querySelector('.view:not([hidden])');
    currentKey = key;
    updateNav(key);
    clearTimeout(swapTimer);

    const swap = () => {
      document.querySelectorAll('.view').forEach((v) => {
        v.hidden = true;
        v.classList.remove('is-entering', 'is-leaving');
      });
      if (key === 'histoire') renderStory();
      else if (key !== 'accueil') renderCharacter(data.personnages.find((p) => p.id === key));

      const info = viewFor(key);
      const section = document.getElementById(info.id);
      section.hidden = false;
      document.title = info.title;
      window.scrollTo({ top: 0, behavior: 'auto' });
      if (!reduceMotion.matches && !isFirst) section.classList.add('is-entering');
      if (!isFirst) $(info.focus)?.focus({ preventScroll: true });
    };

    if (isFirst || reduceMotion.matches || !previous) swap();
    else {
      previous.classList.add('is-leaving');
      swapTimer = setTimeout(swap, 230);
    }
  }

  /* ---------- Erreur de chargement ---------- */
  function showError(err) {
    const box = $('#erreur');
    box.hidden = false;
    box.replaceChildren(
      el('p', {}, el('strong', {}, 'Impossible de charger le fichier characters.json.')),
      el('p', {}, 'Si tu as ouvert index.html directement depuis ton disque, le navigateur bloque la lecture du fichier JSON. Lance un petit serveur local depuis le dossier du site, par exemple :'),
      el('p', {}, el('code', {}, 'python3 -m http.server 8000')),
      el('p', {}, 'puis ouvre http://localhost:8000. Sur GitHub Pages ou Netlify, aucun réglage n’est nécessaire.')
    );
    $('#vue-accueil').hidden = true;
    console.error(err);
  }

  /* ---------- Démarrage ---------- */
  async function init() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (err) {
      showError(err);
      return;
    }
    renderHome();
    renderFooter();
    window.addEventListener('hashchange', route);
    route();
  }

  init();
})();
