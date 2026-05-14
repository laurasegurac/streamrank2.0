/* ===================================================
   LISTAS.JS — Conectado al backend
   verDespues e historial → DB via API
   tops → localStorage (datos complejos)
=================================================== */

(function () {
  'use strict';

  const API_URL = 'http://localhost:3000';

  /* ── Tops: siguen en localStorage ── */
  function getTopsKey() {
    const user = Auth.getUser();
    return user ? `streamrank_tops_${user.id}` : null;
  }

  function loadTops() {
    const key = getTopsKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }

  function saveTops(tops) {
    const key = getTopsKey();
    if (key) localStorage.setItem(key, JSON.stringify(tops));
  }

  /* ── Cache en memoria para evitar fetch repetidos ── */
  let _cache = { verDespues: [], historial: [] };
  let _cacheLoaded = false;

  async function fetchLists() {
    const user = Auth.getUser();
    if (!user) return { verDespues: [], historial: [] };
    try {
      const res  = await fetch(`${API_URL}/api/lists/${user.id}`);
      const data = await res.json();
      if (data.ok) {
        _cache = data.data;
        _cacheLoaded = true;
      }
      return _cache;
    } catch {
      return _cache;
    }
  }

  /* ── API PÚBLICA ── */
  window.Listas = {

    /* Cargar listas del servidor */
    async cargar() {
      return await fetchLists();
    },

    /* Guardar en watchlist */
    async guardar(item) {
      const user = Auth.getUser();
      if (!user) return 'no-auth';

      // Revisar cache
      if (_cache.historial.find(i => i.id === item.id)) return 'historial';
      if (_cache.verDespues.find(i => i.id === item.id)) return 'duplicado';

      try {
        const res  = await fetch(`${API_URL}/api/lists`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ userId: user.id, movieId: item.id, status: 'watchlist' }),
        });
        const data = await res.json();
        if (data.ok) {
          _cache.verDespues.push(item);
          return 'ok';
        }
        return 'error';
      } catch { return 'error'; }
    },

    /* Quitar de watchlist */
    async quitar(id) {
      const user = Auth.getUser();
      if (!user) return false;
      try {
        const res = await fetch(`${API_URL}/api/lists/${user.id}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) {
          _cache.verDespues = _cache.verDespues.filter(i => i.id !== id);
          return true;
        }
        return false;
      } catch { return false; }
    },

    /* Mover a historial */
    async moverAHistorial(id, extraData = {}) {
      const user = Auth.getUser();
      if (!user) return false;

      const fechaHoy = new Date().toLocaleDateString('es-CO', { day:'numeric', month:'numeric', year:'numeric' });

      try {
        // Actualizar status a 'watched' + datos extra
        const res = await fetch(`${API_URL}/api/lists/${user.id}/${id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: 'watched', fechaVisto: fechaHoy, ...extraData }),
        });
        const data = await res.json();
        if (data.ok) {
          const item = _cache.verDespues.find(i => i.id === id);
          if (item) {
            _cache.historial.unshift({ ...item, status: 'watched', fechaVisto: fechaHoy, ...extraData });
            _cache.verDespues = _cache.verDespues.filter(i => i.id !== id);
          }
          return true;
        }
        return false;
      } catch { return false; }
    },

    /* Actualizar campo del historial (rating, nota, liked, etc.) */
    async actualizarHistorial(id, updates) {
      const user = Auth.getUser();
      if (!user) return false;
      try {
        const res = await fetch(`${API_URL}/api/lists/${user.id}/${id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.ok) {
          const idx = _cache.historial.findIndex(i => i.id === id);
          if (idx !== -1) _cache.historial[idx] = { ..._cache.historial[idx], ...updates };
          return true;
        }
        return false;
      } catch { return false; }
    },

    /* Eliminar del historial */
    async eliminarDeHistorial(id) {
      const user = Auth.getUser();
      if (!user) return false;
      try {
        const res  = await fetch(`${API_URL}/api/lists/${user.id}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) {
          _cache.historial = _cache.historial.filter(i => i.id !== id);
          return true;
        }
        return false;
      } catch { return false; }
    },

    estaGuardado(id) {
      return !!(_cache.verDespues.find(i => i.id === id) || _cache.historial.find(i => i.id === id));
    },

    estaEnHistorial(id) {
      return !!_cache.historial.find(i => i.id === id);
    },

    getCache() { return _cache; },

    /* Tops siguen en localStorage */
    loadTops,
    saveTops,
  };

  /* ── Sincronizar botones al cargar ── */
  async function sincronizarBotones() {
    if (!Auth.getUser()) return;
    await fetchLists();
    document.querySelectorAll('[data-item-id]').forEach(li => {
      const id  = li.dataset.itemId;
      const btn = li.querySelector('.btn-save');
      if (!btn || !id) return;

      if (window.Listas.estaEnHistorial(id)) {
        btn.classList.add('is-saved', 'is-history');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Ya está en tu historial');
      } else if (window.Listas.estaGuardado(id)) {
        btn.classList.add('is-saved');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Quitar de Ver después');
      } else {
        btn.classList.remove('is-saved', 'is-history');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Guardar en Ver después');
      }
    });
  }

  sincronizarBotones();

  /* ── Click en btn-save ── */
  document.addEventListener('click', async e => {
    const saveBtn = e.target.closest('.btn-save');
    if (!saveBtn) return;

    const user = Auth.getUser();
    if (!user) return;

    const li = saveBtn.closest('[data-item-id]');
    if (!li) return;

    const itemId = li.dataset.itemId;

    if (window.Listas.estaEnHistorial(itemId)) {
      showToast('Ya está en tu Historial');
      return;
    }

    if (window.Listas.estaGuardado(itemId)) {
      const ok = await window.Listas.quitar(itemId);
      if (ok) {
        saveBtn.classList.remove('is-saved');
        saveBtn.setAttribute('aria-pressed', 'false');
        saveBtn.setAttribute('title', 'Guardar en Ver después');
        showToast(`"${extraerTitulo(li)}" quitado de Ver después`);
      }
      return;
    }

    const item = extraerItem(li, itemId);
    const resultado = await window.Listas.guardar(item);

    if (resultado === 'ok') {
      saveBtn.classList.add('is-saved');
      saveBtn.setAttribute('aria-pressed', 'true');
      saveBtn.setAttribute('title', 'Quitar de Ver después');
      showToast(`"${item.title}" agregado a Ver después`);
    } else if (resultado === 'duplicado') {
      showToast(`"${item.title}" ya está en tu lista`);
    } else if (resultado === 'historial') {
      showToast(`"${item.title}" ya está en tu Historial`);
    }
  });

  function extraerItem(li, itemId) {
    const card = li.querySelector('.card') || li;
    return {
      id:       itemId,
      title:    (card.querySelector('.card__title') || card.querySelector('.info-title'))?.textContent?.trim() || '',
      type:     (card.querySelector('.card__type')  || card.querySelector('.tag-type'))?.textContent?.trim() || '',
      genres:   (card.querySelector('.card__genres')|| card.querySelector('.tag-genre'))?.textContent?.replace('•','')?.trim() || '',
      rating:   (card.querySelector('.card__rating')|| card.querySelector('.rating-text'))?.textContent?.replace(/[^\d.]/g, '')?.trim() || '',
      desc:     (card.querySelector('.card__desc')  || card.querySelector('.info-desc'))?.textContent?.trim() || '',
      img:      (card.querySelector('.card__thumb img') || card.querySelector('.card-image'))?.src || '',
      platform: (card.querySelector('.platform-badge') || card.querySelector('.tag-platform'))?.textContent?.trim() || '',
    };
  }

  function extraerTitulo(li) {
    const card = li.querySelector('.card') || li;
    return (card.querySelector('.card__title') || card.querySelector('.info-title'))?.textContent?.trim() || 'Elemento';
  }

  function showToast(msg) {
    let t = document.getElementById('listasToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'listasToast';
      t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#0F172B;border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:9999px;box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:700;opacity:0;transition:opacity 0.25s,transform 0.25s;font-family:var(--font-main);white-space:nowrap;`;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; }, 2800);
  }

})();