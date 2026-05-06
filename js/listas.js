/* ===================================================
   LISTAS.JS
   Maneja el botón .btn-save desde CUALQUIER página.
   Se incluye en index.html, top-lista.html, etc.
   junto a auth.js y auth-modal.js.
=================================================== */

(function () {
  'use strict';

  /* ── STORAGE ── */
  function getKey() {
    const user = Auth.getUser();
    return user ? `streamrank_listas_${user.id}` : null;
  }

  function loadData() {
    const key = getKey();
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

  function saveData(data) {
    const key = getKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  /* ── API PÚBLICA ── */
  window.Listas = {
    guardar(item) {
      const data = loadData();
      if (data.historial.find(i => i.id === item.id)) return 'historial';
      if (data.verDespues.find(i => i.id === item.id)) return 'duplicado';
      data.verDespues.push(item);
      saveData(data);
      return 'ok';
    },
    estaGuardado(id) {
      const data = loadData();
      return !!(data.verDespues.find(i => i.id === id) || data.historial.find(i => i.id === id));
    },
    /* Para que mis-listas.js pueda leer los mismos datos */
    loadData,
    saveData,
  };

  /* ── Marcar botones ya guardados al cargar ── */
  function sincronizarBotones() {
    if (!Auth.getUser()) return;
    document.querySelectorAll('li[data-item-id] .btn-save').forEach(btn => {
      const id = btn.closest('li[data-item-id]')?.dataset.itemId;
      if (id && window.Listas.estaGuardado(id)) {
        btn.classList.add('is-saved');
        btn.setAttribute('aria-pressed', 'true');
      }
    });
  }

  sincronizarBotones();

  /* ── Click en btn-save ── */
  document.addEventListener('click', e => {
    const saveBtn = e.target.closest('.btn-save');
    if (!saveBtn) return;

    const user = Auth.getUser();
    if (!user) return; /* auth-modal.js lo intercepta antes */

    const li = saveBtn.closest('li[data-item-id]');
    if (!li) return;

    const itemId = li.dataset.itemId;
    const card   = li.querySelector('.card');
    if (!card) return;

    const item = {
      id:       itemId,
      title:    card.querySelector('.card__title')?.textContent?.trim()     || '',
      type:     card.querySelector('.card__type')?.textContent?.trim()      || '',
      genres:   card.querySelector('.card__genres')?.textContent?.trim()    || '',
      rating:   card.querySelector('.card__rating')?.textContent?.replace(/[^\d.]/g, '')?.trim() || '',
      desc:     card.querySelector('.card__desc')?.textContent?.trim()      || '',
      img:      card.querySelector('.card__thumb img')?.src                 || '',
      platform: card.querySelector('.platform-badge')?.textContent?.trim() || '',
    };

    const resultado = Listas.guardar(item);

    if (resultado === 'ok') {
      saveBtn.classList.add('is-saved');
      saveBtn.setAttribute('aria-pressed', 'true');
      showToast(`"${item.title}" agregado a Ver después`);
    } else if (resultado === 'duplicado') {
      showToast(`"${item.title}" ya está en tu lista`);
    } else {
      showToast(`"${item.title}" ya está en tu Historial`);
    }
  });

  /* ── Toast ── */
  function showToast(msg) {
    let t = document.getElementById('listasToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'listasToast';
      t.style.cssText = `
        position:fixed;bottom:28px;left:50%;
        transform:translateX(-50%) translateY(20px);
        background:#0F172B;border:1px solid rgba(255,255,255,0.12);
        color:#fff;font-size:14px;font-weight:600;
        padding:12px 24px;border-radius:9999px;
        box-shadow:0 8px 24px rgba(0,0,0,0.4);
        z-index:700;opacity:0;
        transition:opacity 0.25s,transform 0.25s;
        font-family:var(--font-main);white-space:nowrap;`;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2800);
  }

})();