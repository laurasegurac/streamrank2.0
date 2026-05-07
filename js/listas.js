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

    // NUEVO: quitar de verDespues
    quitar(id) {
      const data = loadData();
      const estaba = !!data.verDespues.find(i => i.id === id);
      if (!estaba) return false;
      data.verDespues = data.verDespues.filter(i => i.id !== id);
      saveData(data);
      return true;
    },

    estaGuardado(id) {
      const data = loadData();
      return !!(data.verDespues.find(i => i.id === id) ||
                data.historial.find(i => i.id === id));
    },

    estaEnHistorial(id) {
      const data = loadData();
      return !!data.historial.find(i => i.id === id);
    },

    loadData,
    saveData,
  };

  /* ── Marcar botones ya guardados al cargar ── */
  function sincronizarBotones() {
    if (!Auth.getUser()) return;
    document.querySelectorAll('[data-item-id]').forEach(li => {
      const id  = li.dataset.itemId;
      const btn = li.querySelector('.btn-save');
      if (!btn || !id) return;

      if (window.Listas.estaEnHistorial(id)) {
        // En historial: queda marcado pero sin poder quitar
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

  /* ── Click en btn-save: TOGGLE guardar / quitar ── */
  document.addEventListener('click', e => {
    const saveBtn = e.target.closest('.btn-save');
    if (!saveBtn) return;

    const user = Auth.getUser();
    if (!user) return; // auth-modal.js lo intercepta antes

    const li = saveBtn.closest('[data-item-id]');
    if (!li) return;

    const itemId = li.dataset.itemId;

    // Si ya está en historial no se puede quitar desde aquí
    if (window.Listas.estaEnHistorial(itemId)) {
      showToast('Ya está en tu Historial');
      return;
    }

    // TOGGLE: si ya está guardado → quitar; si no → guardar
    if (window.Listas.estaGuardado(itemId)) {
      window.Listas.quitar(itemId);
      saveBtn.classList.remove('is-saved');
      saveBtn.setAttribute('aria-pressed', 'false');
      saveBtn.setAttribute('title', 'Guardar en Ver después');
      const title = extraerTitulo(li);
      showToast(`"${title}" quitado de Ver después`);
      return;
    }

    // Guardar: extraer datos de la tarjeta
    const item = extraerItem(li, itemId);
    const resultado = window.Listas.guardar(item);

    if (resultado === 'ok') {
      saveBtn.classList.add('is-saved');
      saveBtn.setAttribute('aria-pressed', 'true');
      saveBtn.setAttribute('title', 'Quitar de Ver después');
      showToast(`"${item.title}" agregado a Ver después`);
    } else if (resultado === 'duplicado') {
      showToast(`"${item.title}" ya está en tu lista`);
    } else {
      showToast(`"${item.title}" ya está en tu Historial`);
    }
  });

  /* ── Extraer datos de la tarjeta (compatible con index.html y top-lista.html) ── */
  function extraerItem(li, itemId) {
    const card = li.querySelector('.card') || li;
    return {
      id:       itemId,
      title:    (card.querySelector('.card__title') || card.querySelector('.info-title'))
                  ?.textContent?.trim() || '',
      type:     (card.querySelector('.card__type')  || card.querySelector('.tag-type'))
                  ?.textContent?.trim() || '',
      genres:   (card.querySelector('.card__genres')|| card.querySelector('.tag-genre'))
                  ?.textContent?.replace('•','')?.trim() || '',
      rating:   (card.querySelector('.card__rating')|| card.querySelector('.rating-text'))
                  ?.textContent?.replace(/[^\d.]/g, '')?.trim() || '',
      desc:     (card.querySelector('.card__desc')  || card.querySelector('.info-desc'))
                  ?.textContent?.trim() || '',
      img:      (card.querySelector('.card__thumb img') || card.querySelector('.card-image'))
                  ?.src || '',
      platform: (card.querySelector('.platform-badge') || card.querySelector('.tag-platform'))
                  ?.textContent?.trim() || '',
    };
  }

  function extraerTitulo(li) {
    const card = li.querySelector('.card') || li;
    return (card.querySelector('.card__title') || card.querySelector('.info-title'))
             ?.textContent?.trim() || 'Elemento';
  }

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