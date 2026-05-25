/* ===================================================
   TOP-LISTA.JS — Lee datos desde el back (/api/movies)
=================================================== */

(function () {
  'use strict';

  const API_URL = 'http://localhost:3000';

  const PLATFORM_BADGE = {
    'netflix':       { label: 'NETFLIX',   cls: 'platform-badge--netflix' },
    'amazon-prime':  { label: 'PRIME',     cls: 'platform-badge--prime'   },
    'disney-plus':   { label: 'DISNEY+',   cls: 'platform-badge--disney'  },
    'hbo-max':       { label: 'HBO MAX',   cls: 'platform-badge--hbo'     },
    'apple-tv':      { label: 'APPLE TV+', cls: 'platform-badge--apple'   },
  };

  function getBadge(categoria) {
    return PLATFORM_BADGE[categoria] || { label: 'TOP 10', cls: 'platform-badge--netflix' };
  }

  const NOMBRES = {
    'netflix':        'Netflix',
    'amazon-prime':   'Amazon Prime',
    'disney-plus':    'Disney+',
    'hbo-max':        'HBO Max',
    'apple-tv':       'Apple TV+',
    'warner':         'Warner Bros',
    'pixar':          'Pixar',
    'disney':         'Disney',
    'studio-ghibli':  'Studio Ghibli',
    'star-wars':      'Star Wars',
    'harry-potter':   'Harry Potter',
    'lotr':           'Lord of the Rings',
    'mcu':            'Marvel Cinematic Universe',
  };

  const params    = new URLSearchParams(window.location.search);
  const categoria = params.get('categoria') || 'netflix';
  const nombre    = NOMBRES[categoria] || categoria;
  const badge     = getBadge(categoria);

  document.title = `StreamRank — Top 10: ${nombre}`;
  document.getElementById('listaNombre').textContent = nombre;

  /* ── ESTADO ── */
  const state = { type: 'all', genre: '', duration: '', sort: 'rating' };

  /* ── REFERENCIAS DOM ── */
  const list        = document.getElementById('rankingList');
  const tabBtns     = document.querySelectorAll('.filter-tab');
  const genreSelect = document.getElementById('filter-genre');
  const durSelect   = document.getElementById('filter-duration');
  const sortBtns    = document.querySelectorAll('.sort-btn');

  let ITEMS = []; // datos del back
  render();

  /* ── HELPERS ── */
  function durationBucket(dur) {
    if (!dur) return '';
    const mins = parseInt(dur);
    if (isNaN(mins)) return ''; // ej: "3 Temporadas"
    if (mins < 90)   return 'short';
    if (mins <= 120) return 'medium';
    return 'long';
  }
  function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // quita tildes
  }


  function matches(item) {
    const tipo = (item.type || '').toLowerCase();
    if (state.type === 'movie'  && tipo !== 'película') return false;
    if (state.type === 'series' && tipo !== 'serie')    return false;

    if (state.genre) {
      const generos = Array.isArray(item.genres)
        ? item.genres.map(g => normalizar(g))
        : [normalizar(String(item.genres || ''))];
      if (!generos.some(g => g.includes(normalizar(state.genre)))) return false;
    }

    if (state.duration) {
      const mins = parseInt(item.duration);
      if (!isNaN(mins) && durationBucket(mins) !== state.duration) return false;
    }

    return true;
    }




  

  function cardHTML(item, rank) {
    const generosTxt = Array.isArray(item.genres)
      ? item.genres.join(', ')
      : (item.genres || '');

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
              <span class="card__rating" aria-label="Rating ${item.rating}">
                <img src="assets/icons/Estrella.svg" alt="" class="card-rating-icon" />
                ${item.rating}
              </span>
              <span class="card__pts" aria-label="${item.points} puntos">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                  <path d="M2 10l3-4 3 2 4-6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${(item.points || 0).toLocaleString('es')} pts
              </span>
            </div>
          </div>
          <div class="card__side">
          <span class="platform-badge ${badge.cls}">${badge.label}</span>
          <button class="btn-save" aria-label="Guardar ${item.title}" aria-pressed="false">
            <img src="assets/icons/agregar.svg" alt="" class="save-icon" />
          </button>
          </div>
        </article>
      </li>`;
  }

  function render() {
    const visible = ITEMS.filter(matches);
    visible.sort((a, b) =>
      state.sort === 'rating'
        ? b.rating - a.rating
        : (b.points || 0) - (a.points || 0)
    );

    if (visible.length === 0) {
      list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);">No hay resultados para estos filtros.</p></li>`;
      return;
    }

    list.innerHTML = visible.map((item, i) => cardHTML(item, i + 1)).join('');
  }

  /* ── CARGAR DATOS DEL BACK ── */
  async function cargarDatos() {
    list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);">Cargando...</p></li>`;

    try {
      const res  = await fetch(`${API_URL}/api/movies?categoria=${categoria}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        ITEMS = data;
      } else if (data[categoria]) {
        // Si el JSON es un objeto por categorías
        ITEMS = data[categoria];
      } else {
        // Fallback: buscar en todos los valores
        const todos = Object.values(data).flat();
        ITEMS = todos.filter(i => i.categoria === categoria);
      }
      window._ITEMS = ITEMS;

      render();
    } catch (err) {
      list.innerHTML = `<li><p style="padding:40px 0;text-align:center;color:var(--color-text-muted);">Error cargando datos. ¿Está el servidor encendido?</p></li>`;
      console.error(err);
    }
  }

  /* ── EVENTOS ── */
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