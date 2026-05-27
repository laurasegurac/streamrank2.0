/* ===================================================
   SEARCH.JS — Búsqueda global compartida
   Se incluye en todas las páginas
=================================================== */

(function () {
  'use strict';

  const API_URL = 'http://localhost:3000';

  function normalizeSearch(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function getPlatformLabel(platform) {
    const key = (platform || '').toLowerCase();
    if (key.includes('netflix'))                       return 'NETFLIX';
    if (key.includes('amazon') || key.includes('prime')) return 'PRIME';
    if (key.includes('disney'))                        return 'DISNEY+';
    if (key.includes('hbo'))                           return 'HBO MAX';
    if (key.includes('apple'))                         return 'APPLE TV+';
    return '';
  }

  function obtenerCatalogoLocal() {
    if (Array.isArray(window.CATALOGO_COMPLETO) && window.CATALOGO_COMPLETO.length) {
      return window.CATALOGO_COMPLETO;
    }
    if (Array.isArray(window._ITEMS) && window._ITEMS.length) {
      return window._ITEMS;
    }
    return [];
  }

  /* ── Cargar catálogo si no está ya cargado ── */
  async function asegurarCatalogo() {
    if (window.CATALOGO_COMPLETO && window.CATALOGO_COMPLETO.length) return;

    const localCatalog = obtenerCatalogoLocal();
    if (localCatalog.length) {
      window.CATALOGO_COMPLETO = localCatalog;
      return;
    }

    try {
      let res  = await fetch(`${API_URL}/api/movies`);
      if (!res.ok) {
        throw new Error(`Search: fetch /api/movies respondió ${res.status}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Search: respuesta no es JSON (${parseErr.message})`);
      }

      if (!Array.isArray(data) && !Object.keys(data).length) {
        throw new Error('Search: catálogo vacío');
      }

      const vistos = new Set();
      const todos  = [];
      const source = Array.isArray(data) ? { all: data } : data;
      for (const items of Object.values(source)) {
        for (const item of items) {
          const key = item.tmdbId || item.id;
          if (!vistos.has(key)) { vistos.add(key); todos.push(item); }
        }
      }

      if (!todos.length) {
        res = await fetch(`${API_URL}/api/movies?global=true`);
        if (!res.ok) {
          throw new Error(`Search: fetch /api/movies?global=true respondió ${res.status}`);
        }

        try {
          data = await res.json();
        } catch (parseErr) {
          throw new Error(`Search: respuesta global no es JSON (${parseErr.message})`);
        }
      }

      const source2 = Array.isArray(data) ? { all: data } : data;
      for (const items of Object.values(source2)) {
        for (const item of items) {
          const key = item.tmdbId || item.id;
          if (!vistos.has(key)) { vistos.add(key); todos.push(item); }
        }
      }

      window.CATALOGO_COMPLETO = todos;
    } catch (err) {
      console.error('Search: error cargando catálogo', err);
      const fallback = obtenerCatalogoLocal();
      window.CATALOGO_COMPLETO = fallback.length ? fallback : [];
    }
  }

  /* ── Inicializar búsqueda ── */
  async function initSearch() {
    const searchInput = document.getElementById('site-search');
    if (!searchInput) return;

    // Cargar catálogo en paralelo
    asegurarCatalogo();

    const searchWrap = searchInput.closest('.search-form');
    if (!searchWrap) return;
    searchWrap.style.position = 'relative';

    const dropdown = document.createElement('div');
    dropdown.id = 'searchDropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 360px;
      background: #0F172B;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      overflow-y: auto;
      max-height: 400px;
      z-index: 9999;
      display: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    `;
    searchWrap.appendChild(dropdown);

    searchInput.addEventListener('input', async () => {
      const q = normalizeSearch(searchInput.value.trim());
      if (!q || q.length < 2) { dropdown.style.display = 'none'; return; }

      // Esperar catálogo si aún no está
      if (!window.CATALOGO_COMPLETO || !window.CATALOGO_COMPLETO.length) {
        await asegurarCatalogo();
      }

      const catalogo  = window.CATALOGO_COMPLETO || [];
      const resultados = catalogo.filter(item =>
        normalizeSearch(item.title || '').includes(q) ||
        normalizeSearch((Array.isArray(item.genres) ? item.genres.join(' ') : item.genres) || '').includes(q)
      ).slice(0, 8);

      if (!resultados.length) { dropdown.style.display = 'none'; return; }

      const label = getPlatformLabel;
      dropdown.innerHTML = resultados.map(item => {
        const generos = Array.isArray(item.genres) ? item.genres.slice(0, 2).join(', ') : '';
        const plat    = label(item.platform);
        return `
          <div class="search-result-item" data-id="${item.id}" style="
            display:flex; align-items:center; gap:12px;
            padding:10px 14px; cursor:pointer;
            border-bottom:1px solid rgba(255,255,255,0.05);
            transition: background 0.15s;
          ">
            <img src="${item.img || ''}" alt="${item.title}" style="
              width:36px; height:52px; border-radius:4px;
              object-fit:cover; flex-shrink:0;
            " onerror="this.style.display='none'"/>
            <div style="flex:1; min-width:0;">
              <p style="margin:0; font-size:14px; font-weight:600; color:#fff;
                        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${item.title}
              </p>
              <p style="margin:0; font-size:12px; color:#8D95A5;">
                ${item.type || ''} ${generos ? '· ' + generos : ''}
              </p>
            </div>
            ${plat ? `<span style="
              font-size:10px; font-weight:700; padding:3px 8px;
              border-radius:4px; background:var(--color-brand);
              color:#fff; flex-shrink:0;
            ">${plat}</span>` : ''}
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
          if (window.Modal) {
            window.Modal.open(id);
          } else {
            // En páginas sin modal → ir al inicio con el id
            window.location.href = `index.html?open=${id}`;
          }
        });
      });
    });

    document.addEventListener('click', e => {
      if (!searchWrap.contains(e.target)) dropdown.style.display = 'none';
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dropdown.style.display = 'none'; searchInput.value = ''; }
    });
  }

  document.addEventListener('DOMContentLoaded', initSearch);

})();