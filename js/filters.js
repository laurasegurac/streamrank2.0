(function () {
  'use strict';

  const API_URL = 'http://localhost:3000';

  const state = { type: 'all', genre: '', duration: '', sort: 'rating' };

  const list        = document.getElementById('rankingList');
  const tabBtns     = document.querySelectorAll('.filter-tab');
  const genreSelect = document.getElementById('filter-genre');
  const durSelect   = document.getElementById('filter-duration');
  const sortBtns    = document.querySelectorAll('.sort-btn');

  let ITEMS = [];
  window._ITEMS = [];

  const PLATFORM_CLS = {
    'netflix':            'platform-badge--netflix',
    'amazon prime video': 'platform-badge--prime',
    'disney+':            'platform-badge--disney',
    'hbo max':            'platform-badge--hbo',
    'apple tv+':          'platform-badge--apple',
  };

  const PLATFORM_LABEL = {
    'netflix':            'NETFLIX',
    'amazon prime video': 'PRIME',
    'disney+':            'DISNEY+',
    'hbo max':            'HBO MAX',
    'apple tv+':          'APPLE TV+',
  };

  function getPlatformInfo(platform) {
    // Acepta string, array u objeto. Normaliza a string segura.
    let key = '';
    if (Array.isArray(platform)) key = platform.join(' ').toLowerCase();
    else if (platform && typeof platform === 'object') key = (platform.name || platform.label || '') .toLowerCase();
    else key = String(platform || '').toLowerCase();

    if (!key) return { cls: '', label: '' };

    if (key.includes('netflix')) return { cls: 'platform-badge--netflix', label: 'NETFLIX' };
    if (key.includes('amazon') || key.includes('prime')) return { cls: 'platform-badge--prime', label: 'PRIME' };
    if (key.includes('disney')) return { cls: 'platform-badge--disney', label: 'DISNEY+' };
    if (key.includes('hbo')) return { cls: 'platform-badge--hbo', label: 'HBO MAX' };
    if (key.includes('apple')) return { cls: 'platform-badge--apple', label: 'APPLE TV+' };

    // Plataforma no reconocida: devolver etiqueta cruda
    return { cls: 'platform-badge--default', label: platform || key || '' };
  }
  
  
  
  
  
  

  function normalizar(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function durationBucket(dur) {
    const mins = parseInt(dur);
    if (isNaN(mins)) return '';
    if (mins < 90)   return 'short';
    if (mins <= 120) return 'medium';
    return 'long';
  }
  function matches(item) {
  const tipo = normalizar(item.type || '');
  if (state.type === 'movie'  && tipo !== 'pelicula') return false;
  if (state.type === 'series' && tipo !== 'serie')    return false;

  if (state.genre) {
    const generos = Array.isArray(item.genres)
      ? item.genres.map(g => normalizar(g))
      : [normalizar(String(item.genres || ''))];
    if (!generos.some(g => g.includes(normalizar(state.genre)))) return false;
  }

  if (state.duration) {
    const mins = parseInt(item.duration);
    if (!isNaN(mins) && durationBucket(item.duration) !== state.duration) return false;
  }

  return true;
}





  function cardHTML(item, rank) {
    const generosTxt = Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || '');
    // Normalizar posibles formatos de plataforma en los datos
    function extractPlatform(it) {
      if (!it) return '';
      if (Array.isArray(it) && it.length) return String(it[0]);
      if (typeof it === 'object') return it.name || it.label || '';
      return String(it || '');
    }

    const platformStr = extractPlatform(item.platform || item.platforms || item.categoria || item.category);
    const p = getPlatformInfo(platformStr);

    return `
      <li data-item-id="${item.id}">
        <article class="card" aria-label="Puesto ${rank}: ${item.title}">
          <span class="card__rank" aria-label="Puesto ${rank}">${rank}</span>
          <div class="card__thumb">
            <img src="${item.img || ''}" alt="Póster de ${item.title}" loading="lazy" />
          </div>
          <div class="card__body">
            <div class="card__type-row">
              <span class="card__type">${item.type || ''}</span>
              <span class="card__genres">${generosTxt}</span>
            </div>
            <h2 class="card__title">${item.title}</h2>
            <p class="card__desc">${item.desc || ''}</p>
            <div class="card__stats">
              <span class="card__rating">
                <img src="assets/icons/Estrella.svg" alt="" class="card-rating-icon" />
                ${item.rating}
              </span>
              <span class="card__pts">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M2 10l3-4 3 2 4-6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${(item.points || 0).toLocaleString('es')} pts
              </span>
            </div>
          </div>
          <div class="card__side">
            ${p.label ? `<span class="platform-badge ${p.cls}">${p.label}</span>` : ''}
            <button class="btn-save" aria-label="Guardar ${item.title}" aria-pressed="false">
              <img src="assets/icons/agregar.svg" alt="" class="save-icon" />
            </button>
          </div>
        </article>
      </li>`;
  }
  function actualizarHero(item) {
  if (!item) return;
  const badge  = document.querySelector('.hero__badge');
  const titulo = document.querySelector('.hero__title');
  const desc   = document.querySelector('.hero__desc');
  const img    = document.querySelector('.hero__bg img');
  const btnTrailer = document.querySelector('.btn-hero-primary');
  const btnGuardar = document.querySelector('.btn-hero-secondary');

  if (badge)  badge.innerHTML    = `<img src="assets/icons/Estrella.svg" alt="" class="hero__badge-icon" /> #1 Global · ${item.type}`;
  if (titulo) titulo.textContent = item.title;
  if (desc)   desc.textContent   = item.desc;
  if (img)    img.src            = item.img;

  // Guardar el ID real en los botones
  if (btnTrailer) btnTrailer.dataset.heroId = item.id;
  if (btnGuardar) btnGuardar.dataset.heroId = item.id;
}
  function render() {
  const fuente = (CATALOGO_COMPLETO && CATALOGO_COMPLETO.length)
    ? CATALOGO_COMPLETO
    : ITEMS;

  const visible = fuente.filter(matches);
  visible.sort((a, b) =>
    state.sort === 'rating'
      ? b.rating - a.rating
      : (b.points || 0) - (a.points || 0)
  );

  // Siempre mostrar solo top 10 del resultado filtrado
  const top10 = visible.slice(0, 10);

  if (top10.length === 0) {
    list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);">No hay resultados para estos filtros.</p></li>`;
    return;
  }

  list.innerHTML = top10.map((item, i) => cardHTML(item, i + 1)).join('');
}

let CATALOGO_COMPLETO = []; // todos los items del scraping

async function cargarCatalogoCompleto() {
  try {
    const res  = await fetch(`${API_URL}/api/movies`);
    const data = await res.json();
    
    if (Array.isArray(data)) {
      CATALOGO_COMPLETO = data;
      window.CATALOGO_COMPLETO = CATALOGO_COMPLETO;
    } else {
      // Es objeto por categorías — aplanar todo
      const vistos = new Set();
      const todos  = [];
      for (const items of Object.values(data)) {
        for (const item of items) {
          const key = item.tmdbId || item.id;
          if (!vistos.has(key)) {
            vistos.add(key);
            todos.push(item);
          }
        }
      }
      CATALOGO_COMPLETO = todos;
      window.CATALOGO_COMPLETO = CATALOGO_COMPLETO;
    }
    console.log(`📚 Catálogo completo: ${CATALOGO_COMPLETO.length} items`);
    poblarGeneros();
    render();
  } catch (err) {
    console.error('Error cargando catálogo completo:', err);
    CATALOGO_COMPLETO = ITEMS; // fallback al top
    window.CATALOGO_COMPLETO = ITEMS;
  }
}


  async function cargarDatos() {
    list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);">Cargando...</p></li>`;
    try {
      const res  = await fetch(`${API_URL}/api/movies?global=true`);
      const data = await res.json();
      ITEMS = Array.isArray(data) ? data : [];
      window._ITEMS = ITEMS;

      // Actualizar hero con el #1
      actualizarHero(ITEMS[0]);
      poblarGeneros();
      render();
      mostrarUltimaActualizacion();
      cargarCatalogoCompleto();
    } catch (err) {
      list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);">Error cargando datos.</p></li>`;
      console.error(err);
    }
  }

  async function mostrarUltimaActualizacion() {
    try {
      const res  = await fetch(`${API_URL}/api/last-update`);
      const data = await res.json();
      if (!data.fecha) return;

      const badge = document.getElementById('lastUpdateBadge');
      const fecha = document.getElementById('lastUpdateFecha');
      if (!badge || !fecha) return;

      fecha.textContent = data.fecha;
      badge.style.display = 'inline-flex';
    } catch {}
  }
  function poblarGeneros() {
  const fuente = (CATALOGO_COMPLETO && CATALOGO_COMPLETO.length)
    ? CATALOGO_COMPLETO
    : ITEMS;

  const todos = new Set();
  fuente.forEach(item => {
    const gs = Array.isArray(item.genres) ? item.genres : [item.genres || ''];
    gs.forEach(g => { if (g) todos.add(g); });
  });

  const opciones = [...todos].sort();
  genreSelect.innerHTML = `<option value="">Todos los géneros</option>` +
    opciones.map(g => `<option value="${normalizar(g)}">${g}</option>`).join('');
}

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected','true');
      state.type = btn.dataset.filter;
      render();
    });
  });

  genreSelect.addEventListener('change', () => { state.genre = genreSelect.value; render(); });
  durSelect.addEventListener('change',   () => { state.duration = durSelect.value; render(); });

  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed','true');
      state.sort = btn.dataset.sort;
      render();
    });
  });

  cargarDatos();
  /* ── BÚSQUEDA GLOBAL ── */
const searchInput = document.getElementById('site-search');
if (searchInput) {
  // Crear dropdown de resultados
  const searchWrap = searchInput.closest('.search-form');
  searchWrap.style.position = 'relative';

  const dropdown = document.createElement('div');
  dropdown.id = 'searchDropdown';
  dropdown.style.cssText = `
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #0F172B;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    overflow: hidden;
    z-index: 200;
    display: none;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    max-height: 400px;
    overflow-y: auto;
  `;
  searchWrap.appendChild(dropdown);

  function normalizeSearch(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  searchInput.addEventListener('input', () => {
    const q = normalizeSearch(searchInput.value.trim());
    if (!q || q.length < 2) { dropdown.style.display = 'none'; return; }




    const catalogo = (window.CATALOGO_COMPLETO && window.CATALOGO_COMPLETO.length)
      ? window.CATALOGO_COMPLETO
      : ITEMS;





    const resultados = catalogo.filter(item =>
      normalizeSearch(item.title).includes(q) ||
      normalizeSearch((item.genres || []).join(' ')).includes(q)
    ).slice(0, 8);

    if (!resultados.length) { dropdown.style.display = 'none'; return; }

    dropdown.innerHTML = resultados.map(item => {
      const generos = Array.isArray(item.genres) ? item.genres.slice(0,2).join(', ') : '';
      const p = getPlatformInfo(item.platform);
      return `
        <div class="search-result-item" data-id="${item.id}" style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        ">
          <img src="${item.img}" alt="${item.title}" style="
            width: 36px; height: 52px;
            border-radius: 4px;
            object-fit: cover;
            flex-shrink: 0;
          "/>
          <div style="flex:1; min-width:0;">
            <p style="margin:0; font-size:14px; font-weight:600; color:#fff;
                      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
              ${item.title}
            </p>
            <p style="margin:0; font-size:12px; color:#8D95A5;">${item.type} · ${generos}</p>
          </div>
          ${p.label ? `<span style="
            font-size:10px; font-weight:700;
            padding: 3px 8px;
            border-radius: 4px;
            background: var(--color-brand);
            color: #fff;
            flex-shrink: 0;
          ">${p.label}</span>` : ''}
        </div>`;
    }).join('');

    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('mouseenter', () => el.style.background = 'rgba(255,255,255,0.06)');
      el.addEventListener('mouseleave', () => el.style.background = '');
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        dropdown.style.display = 'none';
        searchInput.value = '';
        // Abrir modal con ese item
        if (window.Modal) window.Modal.open(id);
      });
    });
  });

  // Cerrar al hacer clic afuera
  document.addEventListener('click', e => {
    if (!searchWrap.contains(e.target)) dropdown.style.display = 'none';
  });

  // Cerrar con Escape
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dropdown.style.display = 'none'; searchInput.value = ''; }
  });
}

})();