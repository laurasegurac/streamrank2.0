/* ===================================================
   MIS-LISTAS.JS
   Tabs: ver después | historial | tops personalizados
   Storage: localStorage por usuario
=================================================== */

(function () {
  'use strict';

  /* ── AUTH ── */
  Auth.updateHeaderUI();

  const noAuth = document.getElementById('listasNoAuth');
  const inner  = document.getElementById('listasInner');

  function getStorageKey() {
    const user = Auth.getUser();
    return user ? `streamrank_listas_${user.id}` : null;
  }

  function loadData() {
    const key = getStorageKey();
    if (!key) return { verDespues: [], historial: [], tops: [] };
    try {
      const raw = localStorage.getItem(key);
      const d   = raw ? JSON.parse(raw) : {};
      return {
        verDespues: d.verDespues || d.agregados || [],
        historial:  d.historial  || [],
        tops:       d.tops       || [],
      };
    } catch { return { verDespues: [], historial: [], tops: [] }; }
  }

  function saveData() {
    const key = getStorageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  let data = { verDespues: [], historial: [], tops: [] };

  function initPage() {
    Auth.updateHeaderUI();
    const user = Auth.getUser();
    if (!user) {
      noAuth.hidden = false;
      inner.hidden  = true;
      return;
    }
    noAuth.hidden = true;
    inner.hidden  = false;
    data = loadData();
    renderVerDespues();
    renderHistorial();
    renderTops();
  }

  /* ── CATÁLOGO para tops ── */
  const CATALOGO = [
    { id: 'breaking-bad',    title: 'Breaking Bad',       img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=92&q=70' },
    { id: 'game-of-thrones', title: 'Game of Thrones',    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=92&q=70' },
    { id: 'interstellar',    title: 'Interstellar',       img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=92&q=70' },
    { id: 'stranger-things', title: 'Stranger Things',    img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=92&q=70' },
    { id: 'the-dark-knight', title: 'The Dark Knight',    img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=92&q=70' },
    { id: 'severance',       title: 'Severance',          img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=92&q=70' },
    { id: 'dune',            title: 'Dune: Parte Uno',    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=92&q=70' },
    { id: 'the-boys',        title: 'The Boys',           img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=92&q=70' },
    { id: 'invincible',      title: 'Invincible',         img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=92&q=70' },
    { id: 'dark',            title: 'Dark',               img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=92&q=70' },
    { id: 'inception',       title: 'Inception',          img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=92&q=70' },
    { id: 'squid-game',      title: 'Squid Game',         img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=92&q=70' },
    { id: 'the-wire',        title: 'The Wire',           img: 'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=92&q=70' },
    { id: 'ted-lasso',       title: 'Ted Lasso',          img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=92&q=70' },
  ];

  /* ── HELPERS ── */
  function platformClass(badge) {
    if (!badge) return 'ml-badge--default';
    const b = badge.toLowerCase();
    if (b.includes('netflix'))                     return 'ml-badge--netflix';
    if (b.includes('hbo'))                         return 'ml-badge--hbo';
    if (b.includes('disney'))                      return 'ml-badge--disney';
    if (b.includes('prime') || b.includes('amazon')) return 'ml-badge--prime';
    if (b.includes('apple'))                       return 'ml-badge--apple';
    return 'ml-badge--default';
  }

  function fechaHoy() {
    return new Date().toLocaleDateString('es-CO', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
  }


  /* ══════════════════════════════════════════════
     TABS
  ══════════════════════════════════════════════ */
  const tabBtns   = document.querySelectorAll('.listas-tab');
  const tabPanels = document.querySelectorAll('.tab-content');

  function switchTab(target) {
    tabBtns.forEach(b => {
      b.classList.toggle('is-active', b.dataset.tab === target);
      b.setAttribute('aria-selected', b.dataset.tab === target);
    });
    tabPanels.forEach(p => { p.hidden = p.id !== `tab-${target}`; });
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));


  /* ══════════════════════════════════════════════
     TAB 1 — VER DESPUÉS
     IMPORTANTE: los IDs en mis-listas.html son
     "agregadosVacio" y "agregadosContenedor"
  ══════════════════════════════════════════════ */
  // Soporte para ambas variantes de IDs
  const vdVacio      = document.getElementById('agregadosVacio')      || document.getElementById('verDespuesVacio');
  const vdContenedor = document.getElementById('agregadosContenedor') || document.getElementById('verDespuesContenedor');

  function renderVerDespues() {
    if (!vdVacio || !vdContenedor) return;

    if (data.verDespues.length === 0) {
      vdVacio.hidden = false;
      vdContenedor.innerHTML = '';
      return;
    }
    vdVacio.hidden = true;
    vdContenedor.innerHTML = data.verDespues.map(item => `
      <div class="ml-card" data-id="${item.id}">
        <img src="${item.img}" alt="${item.title}" class="ml-card__img" />
        <div class="ml-card__body">
          <div class="ml-card__tag">${item.type || ''} ${item.genres ? '· ' + item.genres : ''}</div>
          <h3 class="ml-card__title">${item.title}</h3>
          <div class="ml-card__rating">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="#FACC15" aria-hidden="true">
              <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1-3-2.9 4.2-.9z"/>
            </svg>
            ${item.rating || '—'}
          </div>
          <p class="ml-card__desc">${item.desc || ''}</p>
          <div class="ml-card__actions">
            <button class="ml-btn ml-btn--primary btn-en-historial" data-id="${item.id}">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 8l4 4 6-7"/>
              </svg>
              Ya lo vi
            </button>
            <button class="ml-btn ml-btn--ghost btn-eliminar-vd" data-id="${item.id}">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5L11 4"/>
              </svg>
              Eliminar
            </button>
          </div>
        </div>
        <span class="ml-badge ${platformClass(item.platform)}">${item.platform || 'TOP 10'}</span>
      </div>
    `).join('');

    vdContenedor.querySelectorAll('.btn-en-historial').forEach(btn => {
      btn.addEventListener('click', () => moverAHistorial(btn.dataset.id));
    });

    vdContenedor.querySelectorAll('.btn-eliminar-vd').forEach(btn => {
      btn.addEventListener('click', () => {
        data.verDespues = data.verDespues.filter(i => i.id !== btn.dataset.id);
        saveData();
        renderVerDespues();
      });
    });
  }

  function moverAHistorial(id) {
    const item = data.verDespues.find(i => i.id === id);
    if (!item) return;
    if (!data.historial.find(h => h.id === id)) {
      data.historial.unshift({
        ...item,
        fechaVisto: fechaHoy(),
        miRating:   0,
        liked:      false,
        nota:       '',
        estado:     (item.type || '').toLowerCase().includes('serie') ? 'empezada' : null,
        temporada:  1,
        capitulo:   1,
      });
    }
    data.verDespues = data.verDespues.filter(i => i.id !== id);
    saveData();
    renderVerDespues();
    renderHistorial();
    switchTab('historial');
  }


  /* ══════════════════════════════════════════════
     TAB 2 — HISTORIAL
  ══════════════════════════════════════════════ */
  const histVacio      = document.getElementById('historialVacio');
  const histContenedor = document.getElementById('historialContenedor');

  function renderHistorial() {
    if (!histVacio || !histContenedor) return;

    if (data.historial.length === 0) {
      histVacio.hidden = false;
      histContenedor.innerHTML = '';
      return;
    }
    histVacio.hidden = true;

    histContenedor.innerHTML = data.historial.map(item => {
      const esSerie = (item.type || '').toLowerCase().includes('serie');

      const estadoHTML = esSerie ? `
        <div class="hist-fila">
          <label class="hist-label">Estado:</label>
          <select class="hist-select hist-estado" data-id="${item.id}">
            <option value="por_ver"   ${item.estado === 'por_ver'   ? 'selected' : ''}>Por ver</option>
            <option value="empezada"  ${item.estado === 'empezada'  ? 'selected' : ''}>Empezada</option>
            <option value="terminada" ${item.estado === 'terminada' ? 'selected' : ''}>Terminada</option>
          </select>
          ${item.estado !== 'terminada' ? `
            <label class="hist-label">Temp:</label>
            <input type="number" min="1" value="${item.temporada || 1}"
                   class="hist-num hist-temporada" data-id="${item.id}" />
            <label class="hist-label">Cap:</label>
            <input type="number" min="1" value="${item.capitulo || 1}"
                   class="hist-num hist-capitulo" data-id="${item.id}" />
          ` : ''}
        </div>` : '';

      const ratingHTML = [1,2,3,4,5,6,7,8,9,10].map(n => `
        <button class="hist-rating-btn ${item.miRating === n ? 'is-active' : ''}"
                data-id="${item.id}" data-n="${n}">${n}</button>
      `).join('');

      return `
        <div class="hist-card" data-id="${item.id}">
          <div class="hist-card__top">
            <img src="${item.img}" alt="${item.title}" class="hist-card__img" />
            <div class="hist-card__info">
              <h3 class="hist-card__title">${item.title}</h3>
              <p class="hist-card__fecha">Visto el ${item.fechaVisto}</p>
            </div>
            <div class="hist-card__controles">
              ${estadoHTML}
              <div class="hist-fila">
                <span class="hist-label">Mi calificación:</span>
                <div class="hist-rating-nums">${ratingHTML}</div>
              </div>
              <div class="hist-fila hist-fila--acciones">
                <button class="hist-btn-liked ${item.liked ? 'is-liked' : ''}" data-id="${item.id}">
                  ${item.liked
                    ? `<svg width="14" height="14" viewBox="0 0 16 16" fill="#E7000B" aria-hidden="true"><path d="M8 14s-6-3.8-6-8a4 4 0 0 1 6-3.4A4 4 0 0 1 14 6c0 4.2-6 8-6 8z"/></svg> Me encantó`
                    : `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 14s-6-3.8-6-8a4 4 0 0 1 6-3.4A4 4 0 0 1 14 6c0 4.2-6 8-6 8z"/></svg> No me convenció`}
                </button>
                <button class="ml-btn ml-btn--ghost btn-eliminar-hist" data-id="${item.id}">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                       stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5L11 4"/>
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          <div class="hist-card__notas">
            <p class="hist-notas-label">MIS NOTAS (DIARIO)</p>
            <textarea class="hist-textarea hist-nota" data-id="${item.id}"
                      placeholder="Escribe tus pensamientos sobre esto...">${item.nota || ''}</textarea>
          </div>
        </div>`;
    }).join('');

    /* Eventos historial */
    histContenedor.querySelectorAll('.hist-estado').forEach(sel => {
      sel.addEventListener('change', () => {
        updateHistItem(sel.dataset.id, { estado: sel.value });
        renderHistorial();
      });
    });
    histContenedor.querySelectorAll('.hist-temporada').forEach(inp => {
      inp.addEventListener('change', () =>
        updateHistItem(inp.dataset.id, { temporada: parseInt(inp.value) || 1 }));
    });
    histContenedor.querySelectorAll('.hist-capitulo').forEach(inp => {
      inp.addEventListener('change', () =>
        updateHistItem(inp.dataset.id, { capitulo: parseInt(inp.value) || 1 }));
    });
    histContenedor.querySelectorAll('.hist-rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = parseInt(btn.dataset.n);
        updateHistItem(btn.dataset.id, { miRating: n });
        histContenedor
          .querySelectorAll(`.hist-rating-btn[data-id="${btn.dataset.id}"]`)
          .forEach(b => b.classList.toggle('is-active', parseInt(b.dataset.n) === n));
      });
    });
    histContenedor.querySelectorAll('.hist-btn-liked').forEach(btn => {
      btn.addEventListener('click', () => {
        const h = data.historial.find(i => i.id === btn.dataset.id);
        if (!h) return;
        updateHistItem(btn.dataset.id, { liked: !h.liked });
        renderHistorial();
      });
    });
    histContenedor.querySelectorAll('.hist-nota').forEach(ta => {
      ta.addEventListener('input', () =>
        updateHistItem(ta.dataset.id, { nota: ta.value }));
    });
    histContenedor.querySelectorAll('.btn-eliminar-hist').forEach(btn => {
      btn.addEventListener('click', () => {
        data.historial = data.historial.filter(i => i.id !== btn.dataset.id);
        saveData();
        renderHistorial();
      });
    });
  }

  function updateHistItem(id, updates) {
    const idx = data.historial.findIndex(i => i.id === id);
    if (idx === -1) return;
    data.historial[idx] = { ...data.historial[idx], ...updates };
    saveData();
  }


  /* ══════════════════════════════════════════════
     TAB 3 — TOPS PERSONALIZADOS
  ══════════════════════════════════════════════ */
  const topsGrid    = document.getElementById('topsGrid');
  const btnCrear    = document.getElementById('btnCrearTop');
  const formTop     = document.getElementById('formCrearTop');
  const btnGuardar  = document.getElementById('btnGuardarTop');
  const btnCancelar = document.getElementById('btnCancelarTop');
  const nombreInp   = document.getElementById('nombreTop');

  function renderTops() {
    if (!topsGrid) return;
    topsGrid.innerHTML = data.tops.map(top => buildTopCard(top)).join('');
    topsGrid.querySelectorAll('.top-card').forEach(card =>
      initTopCard(card, card.dataset.topId));
  }

  function buildTopCard(top) {
    const items = (top.items || []).map((item, i) => `
      <div class="top-item" draggable="true" data-item-id="${item.id}">
        <span class="top-item__pos">${i + 1}</span>
        <img class="top-item__img" src="${item.img}" alt="${item.title}" loading="lazy" />
        <span class="top-item__titulo">${item.title}</span>
        <button class="top-item__delete" data-item-id="${item.id}"
                type="button" aria-label="Eliminar">✕</button>
      </div>`).join('');

    return `
      <div class="top-card" data-top-id="${top.id}">
        <div class="top-card__header">
          <h3 class="top-card__nombre">${top.nombre}</h3>
          <p class="top-card__meta">
            <span class="top-count">${(top.items || []).length}</span> elementos en esta lista
          </p>
        </div>
        <div class="top-card__items" data-lista>${items}</div>
        <div class="top-card__buscador">
          <div class="top-search-wrap">
            <span class="top-search-icon">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4"/><path d="M10 10l3 3"/>
              </svg>
            </span>
            <input type="text" class="top-search-input" placeholder="Agregar más…" />
          </div>
          <div class="top-search-resultados"></div>
        </div>
      </div>`;
  }

  function initTopCard(cardEl, topId) {
    const lista      = cardEl.querySelector('[data-lista]');
    const contador   = cardEl.querySelector('.top-count');
    const input      = cardEl.querySelector('.top-search-input');
    const resultados = cardEl.querySelector('.top-search-resultados');

    lista.addEventListener('click', e => {
      const del = e.target.closest('.top-item__delete');
      if (!del) return;
      del.closest('.top-item').remove();
      updateTopData(topId, lista, contador);
    });
    lista.addEventListener('dragstart', e =>
      e.target.closest('.top-item')?.classList.add('dragging'));
    lista.addEventListener('dragend', e => {
      e.target.closest('.top-item')?.classList.remove('dragging');
      updateTopData(topId, lista, contador);
    });
    lista.addEventListener('dragover', e => {
      e.preventDefault();
      const drag = lista.querySelector('.dragging');
      if (!drag) return;
      const next = [...lista.querySelectorAll('.top-item:not(.dragging)')]
        .find(s => e.clientY < s.getBoundingClientRect().top + s.getBoundingClientRect().height / 2);
      lista.insertBefore(drag, next || null);
      actualizarPosiciones(lista, contador);
    });

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { resultados.style.display = 'none'; return; }
      const filtrados = CATALOGO.filter(c => c.title.toLowerCase().includes(q));
      if (!filtrados.length) { resultados.style.display = 'none'; return; }
      resultados.innerHTML = filtrados.map(c => `
        <div class="top-resultado-item" data-id="${c.id}"
             data-title="${c.title}" data-img="${c.img}">
          <img src="${c.img}" alt="${c.title}" class="top-resultado-img" loading="lazy" />
          <span>${c.title}</span>
        </div>`).join('');
      resultados.style.display = 'block';
      resultados.querySelectorAll('.top-resultado-item').forEach(r => {
        r.addEventListener('click', () => {
          agregarItemTop(lista, contador, r.dataset.id, r.dataset.title, r.dataset.img);
          updateTopData(topId, lista, contador);
          input.value = '';
          resultados.style.display = 'none';
        });
      });
    });
    document.addEventListener('click', e => {
      if (!cardEl.contains(e.target)) resultados.style.display = 'none';
    });
  }

  function agregarItemTop(lista, contador, id, title, img) {
    const item = document.createElement('div');
    item.className = 'top-item';
    item.draggable = true;
    item.dataset.itemId = id;
    item.innerHTML = `
      <span class="top-item__pos">${lista.children.length + 1}</span>
      <img class="top-item__img" src="${img}" alt="${title}" loading="lazy" />
      <span class="top-item__titulo">${title}</span>
      <button class="top-item__delete" data-item-id="${id}"
              type="button" aria-label="Eliminar">✕</button>`;
    lista.appendChild(item);
    actualizarPosiciones(lista, contador);
  }

  function actualizarPosiciones(lista, contador) {
    lista.querySelectorAll('.top-item').forEach((el, i) =>
      el.querySelector('.top-item__pos').textContent = i + 1);
    if (contador) contador.textContent = lista.children.length;
  }

  function updateTopData(topId, lista, contador) {
    actualizarPosiciones(lista, contador);
    const top = data.tops.find(t => t.id === topId);
    if (!top) return;
    top.items = [...lista.querySelectorAll('.top-item')].map(el => ({
      id:    el.dataset.itemId,
      title: el.querySelector('.top-item__titulo').textContent,
      img:   el.querySelector('.top-item__img').src,
    }));
    saveData();
  }

  if (btnCrear) btnCrear.addEventListener('click', () => {
    formTop.hidden = false;
    btnCrear.style.display = 'none';
    nombreInp.focus();
  });
  if (btnCancelar) btnCancelar.addEventListener('click', () => {
    formTop.hidden = true;
    btnCrear.style.display = '';
    nombreInp.value = '';
  });
  if (btnGuardar) btnGuardar.addEventListener('click', () => {
    const nombre = nombreInp.value.trim() || 'Mi Nuevo Top';
    data.tops.push({ id: Date.now().toString(), nombre, items: [] });
    saveData();
    renderTops();
    formTop.hidden = true;
    btnCrear.style.display = '';
    nombreInp.value = '';
  });


  /* ══════════════════════════════════════════════
     API PÚBLICA (override de listas.js para esta
     página, donde `data` ya está cargado en memoria)
  ══════════════════════════════════════════════ */
  window.Listas = {
    guardar(item) {
      if (data.historial.find(i => i.id === item.id)) return 'historial';
      if (data.verDespues.find(i => i.id === item.id)) return 'duplicado';
      data.verDespues.push(item);
      saveData();
      renderVerDespues();
      return 'ok';
    },
    quitar(id) {
      const estaba = !!data.verDespues.find(i => i.id === id);
      if (!estaba) return false;
      data.verDespues = data.verDespues.filter(i => i.id !== id);
      saveData();
      renderVerDespues();
      return true;
    },
    estaGuardado(id) {
      return !!(data.verDespues.find(i => i.id === id) ||
                data.historial.find(i => i.id === id));
    },
    estaEnHistorial(id) {
      return !!data.historial.find(i => i.id === id);
    },
    loadData: () => data,
    saveData,
  };

  initPage();
  window.addEventListener('auth:changed', initPage);

})();
