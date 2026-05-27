/* ===================================================
   MIS-LISTAS.JS — Conectado al backend
   verDespues e historial → API
   tops → localStorage
=================================================== */

(function () {
  'use strict';

  Auth.updateHeaderUI();

  const noAuth = document.getElementById('listasNoAuth');
  const inner  = document.getElementById('listasInner');

  let data = { verDespues: [], historial: [], tops: [] };

  async function initPage() {
    Auth.updateHeaderUI();
    const user = Auth.getUser();
    if (!user) { noAuth.hidden = false; inner.hidden = true; return; }
    noAuth.hidden = true;
    inner.hidden  = false;

    // Cargar verDespues e historial del servidor
    const listas = await window.Listas.cargar();
    data.verDespues = listas.verDespues || [];
    data.historial  = listas.historial  || [];
    // Tops siguen en localStorage
    data.tops = window.Listas.loadTops();

    renderVerDespues();
    renderHistorial();
    renderTops();

    // Cargar catálogo completo para búsqueda de tops
    if (!window.CATALOGO_COMPLETO || !window.CATALOGO_COMPLETO.length) {
      try {
        const res  = await fetch('http://localhost:3000/api/movies');
        const data = await res.json();
        const vistos = new Set();
        const todos  = [];
        const source = Array.isArray(data) ? { all: data } : data;
        for (const items of Object.values(source)) {
          for (const item of items) {
            const key = item.tmdbId || item.id;
            if (!vistos.has(key)) { vistos.add(key); todos.push(item); }
          }
        }
        window.CATALOGO_COMPLETO = todos;
      } catch (err) {
        console.error('Error cargando catálogo para tops:', err);
      }
    }
  }
  async function cargarCatalogo() {
  try {
    const res  = await fetch('http://localhost:3000/api/movies?global=true');
    const data = await res.json();
    CATALOGO = Array.isArray(data)
      ? data.map(m => ({ id: m.id, title: m.title, img: m.img }))
      : [];
  } catch { CATALOGO = []; }
}

  function normalizar(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  let CATALOGO = [];

  function platformClass(badge) {
    if (!badge) return 'ml-badge--default';
    const b = badge.toLowerCase();
    if (b.includes('netflix'))                       return 'ml-badge--netflix';
    if (b.includes('hbo'))                           return 'ml-badge--hbo';
    if (b.includes('disney'))                        return 'ml-badge--disney';
    if (b.includes('prime') || b.includes('amazon')) return 'ml-badge--prime';
    if (b.includes('apple'))                         return 'ml-badge--apple';
    return 'ml-badge--default';
  }

  function fechaHoy() {
    return new Date().toLocaleDateString('es-CO', { day:'numeric', month:'numeric', year:'numeric' });
  }

  /* ── TABS ── */
  const tabBtns   = document.querySelectorAll('.listas-tab');
  const tabPanels = document.querySelectorAll('.tab-content');

  function switchTab(target) {
    tabBtns.forEach(b => { b.classList.toggle('is-active', b.dataset.tab===target); b.setAttribute('aria-selected', b.dataset.tab===target); });
    tabPanels.forEach(p => { p.hidden = p.id!==`tab-${target}`; });
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  /* ── TAB 1: VER DESPUÉS ── */
  const vdVacio      = document.getElementById('agregadosVacio')      || document.getElementById('verDespuesVacio');
  const vdContenedor = document.getElementById('agregadosContenedor') || document.getElementById('verDespuesContenedor');

  function renderVerDespues() {
    if (!vdVacio || !vdContenedor) return;
    if (data.verDespues.length === 0) { vdVacio.hidden=false; vdContenedor.innerHTML=''; return; }
    vdVacio.hidden = true;
    vdContenedor.innerHTML = data.verDespues.map(item => `
      <div class="ml-card" data-id="${item.id}">
        <img src="${item.img}" alt="${item.title}" class="ml-card__img"/>
        <div class="ml-card__body">
          <div class="ml-card__tag">${item.type||''}${item.genres?' · '+item.genres:''}</div>
          <h3 class="ml-card__title">${item.title}</h3>
          <div class="ml-card__rating">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="#FACC15"><path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1-3-2.9 4.2-.9z"/></svg>
            ${item.rating||'—'}
          </div>
          <p class="ml-card__desc">${item.desc||''}</p>
          <div class="ml-card__actions">
            <button class="ml-btn ml-btn--primary btn-en-historial" data-id="${item.id}">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4 4 6-7"/></svg>
              Ya lo vi
            </button>
            <button class="ml-btn ml-btn--ghost btn-eliminar-vd" data-id="${item.id}">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5L11 4"/></svg>
              Eliminar
            </button>
          </div>
        </div>
        <span class="ml-badge ${platformClass(item.platform)}">${item.platform||'TOP 10'}</span>
      </div>`).join('');

    vdContenedor.querySelectorAll('.btn-en-historial').forEach(btn =>
      btn.addEventListener('click', () => moverAHistorial(btn.dataset.id)));

    vdContenedor.querySelectorAll('.btn-eliminar-vd').forEach(btn =>
      btn.addEventListener('click', async () => {
        const ok = await window.Listas.quitar(btn.dataset.id);
        if (ok) { data.verDespues = data.verDespues.filter(i => i.id!==btn.dataset.id); renderVerDespues(); }
      }));
  }
  async function moverAHistorial(id) {
    const item = data.verDespues.find(i => i.id===id);
    if (!item) return;

    const esS = (item.type||'').toLowerCase().includes('serie');
    const ok  = await window.Listas.moverAHistorial(id, {
      estado: esS ? 'empezada' : null,
      temporada: 1, capitulo: 1,
    });

    if (ok) {
      // Recargar desde el servidor para evitar duplicados
      const listas = await window.Listas.cargar();
      data.verDespues = listas.verDespues || [];
      data.historial  = listas.historial  || [];
      renderVerDespues(); renderHistorial(); switchTab('historial');
    }
  }




  /* ── TAB 2: HISTORIAL ── */
  const histVacio      = document.getElementById('historialVacio');
  const histContenedor = document.getElementById('historialContenedor');

  function renderHistorial() {
    if (!histVacio||!histContenedor) return;
    if (data.historial.length===0) { histVacio.hidden=false; histContenedor.innerHTML=''; return; }
    histVacio.hidden=true;

    histContenedor.innerHTML = data.historial.map(item => {
      const esSerie = (item.type||'').toLowerCase().includes('serie');
      const estadoHTML = esSerie ? `
        <div class="hist-fila">
          <label class="hist-label">Estado:</label>
          <select class="hist-select hist-estado" data-id="${item.id}">
            <option value="por_ver"   ${item.estado==='por_ver'  ?'selected':''}>Por ver</option>
            <option value="empezada"  ${item.estado==='empezada' ?'selected':''}>Empezada</option>
            <option value="terminada" ${item.estado==='terminada'?'selected':''}>Terminada</option>
          </select>
          ${item.estado!=='terminada'?`
            <label class="hist-label">Temp:</label>
            <input type="number" min="1" value="${item.temporada||1}" class="hist-num hist-temporada" data-id="${item.id}"/>
            <label class="hist-label">Cap:</label>
            <input type="number" min="1" value="${item.capitulo||1}" class="hist-num hist-capitulo" data-id="${item.id}"/>`:''}</div>`:'';

      const ratingHTML = [1,2,3,4,5,6,7,8,9,10].map(n=>
        `<button class="hist-rating-btn ${item.miRating===n?'is-active':''}" data-id="${item.id}" data-n="${n}">${n}</button>`
      ).join('');

      return `
        <div class="hist-card" data-id="${item.id}">
          <div class="hist-card__top">
            <img src="${item.img}" alt="${item.title}" class="hist-card__img"/>
            <div class="hist-card__info">
              <h3 class="hist-card__title">${item.title}</h3>
              <p class="hist-card__fecha">Visto el ${item.fechaVisto||''}</p>
            </div>
            <div class="hist-card__controles">
              ${estadoHTML}
              <div class="hist-fila"><span class="hist-label">Mi calificación:</span><div class="hist-rating-nums">${ratingHTML}</div></div>
              <div class="hist-fila hist-fila--acciones">
                <button class="hist-btn-liked ${item.liked?'is-liked':''}" data-id="${item.id}">
                  ${item.liked
                    ?`<svg width="14" height="14" viewBox="0 0 16 16" fill="#E7000B"><path d="M8 14s-6-3.8-6-8a4 4 0 0 1 6-3.4A4 4 0 0 1 14 6c0 4.2-6 8-6 8z"/></svg> Me encantó`
                    :`<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 14s-6-3.8-6-8a4 4 0 0 1 6-3.4A4 4 0 0 1 14 6c0 4.2-6 8-6 8z"/></svg> No me convenció`}
                </button>
                <button class="ml-btn ml-btn--ghost btn-eliminar-hist" data-id="${item.id}">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5L11 4"/></svg>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          <div class="hist-card__notas">
            <p class="hist-notas-label">MIS NOTAS (DIARIO)</p>
            <textarea class="hist-textarea hist-nota" data-id="${item.id}" placeholder="Escribe tus pensamientos...">${item.nota||''}</textarea>
          </div>
        </div>`;
    }).join('');

    histContenedor.querySelectorAll('.hist-estado').forEach(sel=>sel.addEventListener('change', async ()=>{
      await window.Listas.actualizarHistorial(sel.dataset.id,{estado:sel.value});
      updateLocal(sel.dataset.id,{estado:sel.value}); renderHistorial();
    }));
    histContenedor.querySelectorAll('.hist-temporada').forEach(inp=>inp.addEventListener('change',async()=>{
      const v=parseInt(inp.value)||1; await window.Listas.actualizarHistorial(inp.dataset.id,{temporada:v}); updateLocal(inp.dataset.id,{temporada:v});
    }));
    histContenedor.querySelectorAll('.hist-capitulo').forEach(inp=>inp.addEventListener('change',async()=>{
      const v=parseInt(inp.value)||1; await window.Listas.actualizarHistorial(inp.dataset.id,{capitulo:v}); updateLocal(inp.dataset.id,{capitulo:v});
    }));
    histContenedor.querySelectorAll('.hist-rating-btn').forEach(btn=>btn.addEventListener('click',async()=>{
      const n=parseInt(btn.dataset.n);
      await window.Listas.actualizarHistorial(btn.dataset.id,{miRating:n});
      updateLocal(btn.dataset.id,{miRating:n});
      histContenedor.querySelectorAll(`.hist-rating-btn[data-id="${btn.dataset.id}"]`).forEach(b=>b.classList.toggle('is-active',parseInt(b.dataset.n)===n));
    }));
    histContenedor.querySelectorAll('.hist-btn-liked').forEach(btn=>btn.addEventListener('click',async()=>{
      const h=data.historial.find(i=>i.id===btn.dataset.id); if(!h) return;
      const newVal=!h.liked;
      await window.Listas.actualizarHistorial(btn.dataset.id,{liked:newVal});
      updateLocal(btn.dataset.id,{liked:newVal}); renderHistorial();
    }));
    histContenedor.querySelectorAll('.hist-nota').forEach(ta=>{
      let timer;
      ta.addEventListener('input',()=>{
        clearTimeout(timer);
        timer=setTimeout(async()=>{ await window.Listas.actualizarHistorial(ta.dataset.id,{nota:ta.value}); updateLocal(ta.dataset.id,{nota:ta.value}); },800);
      });
    });
    histContenedor.querySelectorAll('.btn-eliminar-hist').forEach(btn=>btn.addEventListener('click',async()=>{
      const ok=await window.Listas.eliminarDeHistorial(btn.dataset.id);
      if(ok){ data.historial=data.historial.filter(i=>i.id!==btn.dataset.id); renderHistorial(); }
    }));
  }

  function updateLocal(id, updates) {
    const idx = data.historial.findIndex(i=>i.id===id);
    if (idx!==-1) data.historial[idx]={...data.historial[idx],...updates};
  }

  /* ── TAB 3: TOPS (localStorage) ── */
  /* ── TAB 3: TOPS (back) ── */
  const topsGrid    = document.getElementById('topsGrid');
  const btnCrear    = document.getElementById('btnCrearTop');
  const formTop     = document.getElementById('formCrearTop');
  const btnGuardar  = document.getElementById('btnGuardarTop');
  const btnCancelar = document.getElementById('btnCancelarTop');
  const nombreInp   = document.getElementById('nombreTop');

  async function renderTops() {
    if (!topsGrid) return;
    data.tops = await window.Listas.loadTops();
    topsGrid.innerHTML = data.tops.map(top => buildTopCard(top)).join('');
    topsGrid.querySelectorAll('.top-card').forEach(card => initTopCard(card, card.dataset.topId));
  }

  async function saveTop(topId, updates) {
    await window.Listas.actualizarTop(topId, updates);
  }

  function buildTopCard(top) {
    const items = (top.items || []).map((item, i) => `
      <div class="top-item" draggable="true" data-item-id="${item.id}">
        <span class="top-item__pos">${i + 1}</span>
        <img class="top-item__img" src="${item.img}" alt="${item.title}" loading="lazy"/>
        <span class="top-item__titulo">${item.title}</span>
        <button class="top-item__delete" type="button">✕</button>
      </div>`).join('');

    return `
      <div class="top-card" data-top-id="${top.id}">
        <div class="top-card__header">
          <div class="top-card__header-row">
            <div class="top-card__nombre-wrap">
              <h3 class="top-card__nombre">${top.nombre}</h3>
              <button class="top-card__btn-icon top-card__btn-rename" type="button" title="Renombrar">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>
              </button>
            </div>
            <div class="top-card__rename-form" style="display:none;">
              <input class="top-card__rename-input" type="text" value="${top.nombre}"/>
              <button class="top-card__btn-icon top-card__btn-rename-ok" type="button">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4 4 6-7"/></svg>
              </button>
              <button class="top-card__btn-icon top-card__btn-rename-cancel" type="button">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
              </button>
            </div>
            <button class="top-card__btn-icon top-card__btn-delete" type="button" title="Eliminar top">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5L11 4"/></svg>
            </button>
          </div>
          <p class="top-card__meta"><span class="top-count">${(top.items || []).length}</span> elementos</p>
        </div>
        <div class="top-card__items" data-lista>${items}</div>
        <div class="top-card__buscador">
          <div class="top-search-wrap">
            <span class="top-search-icon">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6.5" cy="6.5" r="4"/><path d="M10 10l3 3"/>
              </svg>
            </span>
            <input type="text" class="top-search-input" placeholder="Agregar más…"/>
          </div>
          <div class="top-search-resultados"></div>
        </div>
      </div>`;
  }

  function initTopCard(cardEl, topId) {
    const lista     = cardEl.querySelector('[data-lista]');
    const contador  = cardEl.querySelector('.top-count');
    const input     = cardEl.querySelector('.top-search-input');
    const resultados= cardEl.querySelector('.top-search-resultados');

    // ── Eliminar top ──
    cardEl.querySelector('.top-card__btn-delete').addEventListener('click', async () => {
      if (!confirm('¿Eliminar este top?')) return;
      await window.Listas.eliminarTop(topId);
      data.tops = data.tops.filter(t => String(t.id) !== String(topId));
      topsGrid.innerHTML = data.tops.map(top => buildTopCard(top)).join('');
      topsGrid.querySelectorAll('.top-card').forEach(card => initTopCard(card, card.dataset.topId));
    });

    // ── Renombrar ──
    const nombreWrap  = cardEl.querySelector('.top-card__nombre-wrap');
    const renameForm  = cardEl.querySelector('.top-card__rename-form');
    const nombreH3    = cardEl.querySelector('.top-card__nombre');
    const renameInp   = cardEl.querySelector('.top-card__rename-input');

    cardEl.querySelector('.top-card__btn-rename').addEventListener('click', () => {
      nombreWrap.style.display = 'none';
      renameForm.style.display = 'flex';
      renameInp.focus();
      renameInp.select();
    });

    function confirmarRename() {
      const n = renameInp.value.trim();
      if (n) {
        nombreH3.textContent = n;
        const t = data.tops.find(t => String(t.id) === String(topId));
        if (t) { t.nombre = n; saveTop(topId, { nombre: n }); }
      }
      renameForm.style.display = 'none';
      nombreWrap.style.display = 'flex';
    }

    function cancelarRename() {
      renameInp.value = nombreH3.textContent;
      renameForm.style.display = 'none';
      nombreWrap.style.display = 'flex';
    }

    cardEl.querySelector('.top-card__btn-rename-ok').addEventListener('click', confirmarRename);
    cardEl.querySelector('.top-card__btn-rename-cancel').addEventListener('click', cancelarRename);
    renameInp.addEventListener('keydown', e => {
      if (e.key === 'Enter') confirmarRename();
      if (e.key === 'Escape') cancelarRename();
    });

    // ── Eliminar item ──
    lista.addEventListener('click', e => {
      const del = e.target.closest('.top-item__delete');
      if (!del) return;
      del.closest('.top-item').remove();
      updateTopData(topId, lista, contador);
    });

    // ── Drag & drop ──
    lista.addEventListener('dragstart', e => e.target.closest('.top-item')?.classList.add('dragging'));
    lista.addEventListener('dragend',   e => {
      e.target.closest('.top-item')?.classList.remove('dragging');
      updateTopData(topId, lista, contador);
    });
    lista.addEventListener('dragover', e => {
      e.preventDefault();
      const drag = lista.querySelector('.dragging');
      if (!drag) return;
      const next = [...lista.querySelectorAll('.top-item:not(.dragging)')].find(s =>
        e.clientY < s.getBoundingClientRect().top + s.getBoundingClientRect().height / 2
      );
      lista.insertBefore(drag, next || null);
      actualizarPosiciones(lista, contador);
    });

    // ── Buscador ──
    input.addEventListener('input', () => {
      const q = normalizar(input.value.trim());
      if (!q || q.length < 2) { resultados.style.display = 'none'; return; }

      const catalogo = (window.CATALOGO_COMPLETO && window.CATALOGO_COMPLETO.length)
        ? window.CATALOGO_COMPLETO
        : CATALOGO;

      const filtradas = catalogo.filter(c =>
        normalizar(c.title || '').includes(q) ||
        normalizar((Array.isArray(c.genres) ? c.genres.join(' ') : c.genres) || '').includes(q)
      ).slice(0, 8);

      if (!filtradas.length) { resultados.style.display = 'none'; return; }

      resultados.innerHTML = filtradas.map(c => `
        <div class="top-resultado-item"
             data-id="${c.id || c.tmdbId}"
             data-title="${c.title}"
             data-img="${c.img || ''}">
          <img src="${c.img || ''}" class="top-resultado-img" onerror="this.style.display='none'"/>
          <div style="flex:1; min-width:0;">
            <span style="display:block; font-size:14px; font-weight:600; color:#fff;
                         white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${c.title}
            </span>
            <span style="font-size:12px; color:#8D95A5;">
              ${c.type || ''} ${c.platform ? '· ' + c.platform : ''}
            </span>
          </div>
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
    item.className  = 'top-item';
    item.draggable  = true;
    item.dataset.itemId = id;
    item.innerHTML  = `
      <span class="top-item__pos">${lista.children.length + 1}</span>
      <img class="top-item__img" src="${img}" alt="${title}" loading="lazy"/>
      <span class="top-item__titulo">${title}</span>
      <button class="top-item__delete" type="button">✕</button>`;
    lista.appendChild(item);
    actualizarPosiciones(lista, contador);
  }

  function actualizarPosiciones(lista, contador) {
    lista.querySelectorAll('.top-item').forEach((el, i) => {
      el.querySelector('.top-item__pos').textContent = i + 1;
    });
    if (contador) contador.textContent = lista.children.length;
  }

  function updateTopData(topId, lista, contador) {
    actualizarPosiciones(lista, contador);
    const top = data.tops.find(t => String(t.id) === String(topId));
    if (!top) return;
    top.items = [...lista.querySelectorAll('.top-item')].map(el => ({
      id:    el.dataset.itemId,
      title: el.querySelector('.top-item__titulo').textContent,
      img:   el.querySelector('.top-item__img').src,
    }));
    saveTop(topId, { items: top.items });
  }

  // ── Botones formulario ──
  if (btnCrear)    btnCrear.addEventListener('click', () => {
    formTop.hidden = false;
    btnCrear.style.display = 'none';
    nombreInp.focus();
  });

  if (btnCancelar) btnCancelar.addEventListener('click', () => {
    formTop.hidden = true;
    btnCrear.style.display = '';
    nombreInp.value = '';
  });

  if (btnGuardar)  btnGuardar.addEventListener('click', async () => {
    const nombre = nombreInp.value.trim() || 'Mi Nuevo Top';
    const nuevo  = await window.Listas.crearTop(nombre);
    if (nuevo) {
      data.tops.push(nuevo);
      topsGrid.innerHTML = data.tops.map(top => buildTopCard(top)).join('');
      topsGrid.querySelectorAll('.top-card').forEach(card => initTopCard(card, card.dataset.topId));
    }
    formTop.hidden = true;
    btnCrear.style.display = '';
    nombreInp.value = '';
  });

  initPage();
  window.addEventListener('auth:changed', initPage);


  








})();
