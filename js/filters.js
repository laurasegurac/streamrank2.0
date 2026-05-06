/* ===================================================
   filters.js — Filtros interactivos del ranking
   Usado en: index.html
=================================================== */

(function () {
  'use strict';

  /* ── DATOS ─────────────────────────────────────────
     Cada ítem refleja las tarjetas del HTML.
     type:     'series' | 'movie'
     genres:   array de géneros en minúsculas
     duration: minutos (series usan duración por episodio)
     rating:   número
     pts:      puntos de popularidad
  ─────────────────────────────────────────────────── */
  const ITEMS = [
    {
      id: 'breaking-bad',
      type: 'series',
      genres: ['crime', 'drama'],
      duration: 47,
      rating: 9.5,
      pts: 9900,
    },
    {
      id: 'game-of-thrones',
      type: 'series',
      genres: ['fantasy', 'drama'],
      duration: 57,
      rating: 9.3,
      pts: 9600,
    },
    {
      id: 'interstellar',
      type: 'movie',
      genres: ['action', 'scifi'],
      duration: 169,
      rating: 9.2,
      pts: 9800,
    },
    {
      id: 'stranger-things',
      type: 'series',
      genres: ['scifi', 'mystery'],
      duration: 51,
      rating: 9.0,
      pts: 9300,
    },
    {
      id: 'the-dark-knight',
      type: 'movie',
      genres: ['action', 'thriller'],
      duration: 152,
      rating: 8.9,
      pts: 9100,
    },
    {
      id: 'severance',
      type: 'series',
      genres: ['scifi', 'thriller'],
      duration: 52,
      rating: 8.7,
      pts: 8800,
    },
    {
      id: 'dune',
      type: 'movie',
      genres: ['scifi', 'adventure'],
      duration: 155,
      rating: 8.5,
      pts: 8600,
    },
    {
      id: 'the-boys',
      type: 'series',
      genres: ['action', 'comedy'],
      duration: 60,
      rating: 8.4,
      pts: 8400,
    },
    {
      id: 'invincible',
      type: 'series',
      genres: ['animation', 'action'],
      duration: 45,
      rating: 8.3,
      pts: 8100,
    },
    {
      id: 'dark',
      type: 'series',
      genres: ['scifi', 'mystery'],
      duration: 60,
      rating: 8.2,
      pts: 7900,
    },
  ];

  /* ── ESTADO ──────────────────────────────────────── */
  const state = {
    type:     'all',      // 'all' | 'movie' | 'series'
    genre:    '',         // '' | 'action' | 'drama' | ...
    duration: '',         // '' | 'short' | 'medium' | 'long'
    sort:     'rating',   // 'rating' | 'popularity'
  };

  /* ── REFERENCIAS DOM ─────────────────────────────── */
  const list        = document.querySelector('.ranking-list');
  const cards       = Array.from(list.querySelectorAll('li'));
  const tabBtns     = document.querySelectorAll('.filter-tab');
  const genreSelect = document.getElementById('filter-genre');
  const durSelect   = document.getElementById('filter-duration');
  const sortBtns    = document.querySelectorAll('.sort-btn');

  /* Los <li> ya tienen data-item-id en el HTML — no se sobreescribe */

  /* ── HELPERS ─────────────────────────────────────── */
  function durationBucket(mins) {
    if (mins < 90)  return 'short';
    if (mins <= 120) return 'medium';
    return 'long';
  }

  function matches(item) {
    if (state.type !== 'all' && item.type !== state.type) return false;
    if (state.genre && !item.genres.includes(state.genre))  return false;
    if (state.duration && durationBucket(item.duration) !== state.duration) return false;
    return true;
  }

  /* ── RENDER ──────────────────────────────────────── */
  function render() {
    /* Filtrar */
    const visible = ITEMS.filter(matches);

    /* Ordenar */
    visible.sort((a, b) =>
      state.sort === 'rating'
        ? b.rating - a.rating
        : b.pts - a.pts
    );

    /* Construir orden y visibilidad */
    const visibleIds = visible.map(i => i.id);

    /* Reordenar nodos en el DOM */
    visibleIds.forEach(id => {
      const li = cards.find(el => el.dataset.itemId === id);
      if (li) list.appendChild(li); // mueve al final en orden correcto
    });

    /* Mostrar / ocultar y actualizar número de rank */
    let rank = 1;
    cards.forEach(li => {
      const isVisible = visibleIds.includes(li.dataset.itemId);
      li.hidden = !isVisible;
      if (isVisible) {
        const rankEl = li.querySelector('.card__rank');
        if (rankEl) rankEl.textContent = rank++;
      }
    });

    /* Mensaje vacío si no hay resultados */
    let emptyMsg = list.querySelector('.ranking-empty');
    if (visible.length === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement('li');
        emptyMsg.className = 'ranking-empty';
        emptyMsg.innerHTML = `
          <p style="
            padding: 40px 0;
            text-align: center;
            color: var(--color-text-muted);
            font-size: var(--text-sm);
          ">No hay resultados para estos filtros.</p>`;
        list.appendChild(emptyMsg);
      }
      emptyMsg.hidden = false;
    } else if (emptyMsg) {
      emptyMsg.hidden = true;
    }
  }

  /* ── EVENTOS ─────────────────────────────────────── */

  /* Tabs Todos / Películas / Series */
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      state.type = btn.dataset.filter; // 'all' | 'movie' | 'series'
      render();
    });
  });

  /* Select de género */
  genreSelect.addEventListener('change', () => {
    state.genre = genreSelect.value;
    render();
  });

  /* Select de duración */
  durSelect.addEventListener('change', () => {
    state.duration = durSelect.value;
    render();
  });

  /* Botones de ordenar */
  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      state.sort = btn.dataset.sort; // 'rating' | 'popularity'
      render();
    });
  });

  /* Render inicial */
  render();

})();