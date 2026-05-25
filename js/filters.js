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
    const key = (platform || '').toLowerCase();
    return {
      cls:   PLATFORM_CLS[key]   || 'platform-badge--netflix',
      label: PLATFORM_LABEL[key] || (platform || 'TOP 10'),
    };
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
    const p = getPlatformInfo(item.platform);

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
            <span class="platform-badge ${p.cls}">${p.label}</span>
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

    if (badge)  badge.innerHTML  = `<img src="assets/icons/Estrella.svg" alt="" class="hero__badge-icon" /> #1 Global · ${item.type}`;
    if (titulo) titulo.textContent = item.title;
    if (desc)   desc.textContent   = item.desc;
    if (img)    img.src            = item.img;
  }

  function render() {
    const visible = ITEMS.filter(matches);
    visible.sort((a, b) =>
      state.sort === 'rating'
        ? b.rating - a.rating
        : (b.points || 0) - (a.points || 0)
    );

    if (visible.length === 0) {
      list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);">No hay resultados para estos filtros.</p></li>`;
      return;
    }

    list.innerHTML = visible.map((item, i) => cardHTML(item, i + 1)).join('');
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
    } catch (err) {
      list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);">Error cargando datos.</p></li>`;
      console.error(err);
    }
  }
  function poblarGeneros() {
  const todos = new Set();
  ITEMS.forEach(item => {
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

})();