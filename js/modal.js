/* ===================================================
   MODAL.JS — Modal de detalle de película / serie
=================================================== */

(function () {
  'use strict';

    const API_URL = 'https://back-streamrank2-0.onrender.com';

  /* ── CREAR MODAL EN EL DOM ── */
  const modalHTML = `
    <div class="modal-overlay" id="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="floating-card">
        <div class="modal-img-col">
          <img id="modalImg" src="" alt="" />
          <span class="modal-platform-badge" id="modalPlatform"></span>
        </div>
        <div class="modal-content-col">
          <button class="modal-close-btn" id="modalCloseBtn" aria-label="Cerrar">✕</button>
          <div class="modal-tags">
            <span class="modal-tag-type" id="modalType"></span>
            <span class="modal-tag-genre" id="modalGenre"></span>
          </div>
          <h2 class="modal-title" id="modalTitle"></h2>
          <div class="modal-meta">
            <div class="modal-rating">
              <img src="assets/icons/Estrella.svg" alt="" />
              <span id="modalRating"></span>
              <span class="modal-rating-max">/ 10</span>
            </div>
            <div class="modal-duration">
              <img src="assets/icons/Duracion.svg" alt="" />
              <span id="modalDuration"></span>
            </div>
          </div>
          <p class="modal-desc" id="modalDesc"></p>
          <div class="modal-actions">
            <button class="btn-modal-primary" id="modalTrailerBtn">
              <img src="assets/icons/Play.svg" alt="" />
              Ver Tráiler
            </button>
            <button class="btn-modal-secondary" id="modalSaveBtn">
              <img src="assets/icons/agregar.svg" alt="" id="modalSaveIcon" />
              Añadir a mi lista
            </button>
          </div>
          <div class="modal-trailer" id="modalTrailer">
            <iframe id="modalIframe" src="" title="Tráiler" allowfullscreen allow="autoplay"></iframe>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  /* ── REFERENCIAS ── */
  const overlay    = document.getElementById('modalOverlay');
  const closeBtn   = document.getElementById('modalCloseBtn');
  const trailerBtn = document.getElementById('modalTrailerBtn');
  const trailerBox = document.getElementById('modalTrailer');
  const iframe     = document.getElementById('modalIframe');
  const saveBtn    = document.getElementById('modalSaveBtn');
  const saveIcon   = document.getElementById('modalSaveIcon');

  const elImg      = document.getElementById('modalImg');
  const elPlatform = document.getElementById('modalPlatform');
  const elType     = document.getElementById('modalType');
  const elGenre    = document.getElementById('modalGenre');
  const elTitle    = document.getElementById('modalTitle');
  const elRating   = document.getElementById('modalRating');
  const elDuration = document.getElementById('modalDuration');
  const elDesc     = document.getElementById('modalDesc');

  let currentItemId     = null;
  let currentTrailerUrl = '';
  let trailerOpen       = false;

  /* ── ACTUALIZAR ESTADO DEL BOTÓN GUARDAR ── */
  function actualizarBtnGuardar(itemId) {
    if (!window.Listas || !Auth.getUser()) {
      // Sin sesión: mostrar estado neutro
      saveBtn.classList.remove('is-saved');
      saveIcon.src = 'assets/icons/agregar.svg';
      saveBtn.querySelector('span') && (saveBtn.querySelector('span').textContent = 'Añadir a mi lista');
      // Reconstruir texto por si acaso
      saveBtn.innerHTML = '<img src="assets/icons/agregar.svg" alt="" id="modalSaveIcon" /> Añadir a mi lista';
      return;
    }

    const enHistorial = window.Listas.estaEnHistorial(itemId);
    const guardado    = window.Listas.estaGuardado(itemId);

    if (enHistorial) {
      saveBtn.innerHTML = '<img src="assets/icons/agregada.svg" alt="" /> En Historial';
      saveBtn.classList.add('is-saved');
      saveBtn.disabled = true;
    } else if (guardado) {
      saveBtn.innerHTML = '<img src="assets/icons/agregada.svg" alt="" /> Guardado ✓';
      saveBtn.classList.add('is-saved');
      saveBtn.disabled = false;
    } else {
      saveBtn.innerHTML = '<img src="assets/icons/agregar.svg" alt="" /> Añadir a mi lista';
      saveBtn.classList.remove('is-saved');
      saveBtn.disabled = false;
    }
  }

  /* ── ABRIR MODAL ── */
  function openModal(itemId) {
  let d = null;

  // 1. Buscar en DATA hardcodeado
  if (typeof DATA !== 'undefined' && DATA[itemId]) {
    d = DATA[itemId];
  }

  // 2. Buscar en catálogo completo del back
  if (!d) {
    const catalogo = window.CATALOGO_COMPLETO || window._ITEMS || [];
    const found = catalogo.find(i => i.id === itemId);
    if (found) {
      d = {
        title:        found.title || '',
        type:         found.type  || '',
        genres:       Array.isArray(found.genres) ? found.genres.join(', ') : (found.genres || ''),
        rating:       String(found.rating || ''),
        duration:     found.duration || '',
        platform:     found.platform || '',
        platformBadge:found.platform || '',
        desc:         found.desc    || '',
        img:          found.img     || '',
        trailerUrl:   found.trailer || '',
      };
    }
  }

  // 3. Fallback al DOM
  if (!d) d = buildCardFallback(itemId);
  if (!d) return;

  currentItemId     = itemId;
  currentTrailerUrl = d.trailerUrl || '';
  trailerOpen       = false;

  elImg.src              = d.img || '';
  elImg.alt              = d.title || '';
  elPlatform.textContent = d.platform || '';
  elType.textContent     = d.type || '';
  elGenre.textContent    = d.genres ? '• ' + d.genres : '';
  elTitle.textContent    = d.title || '';
  elRating.textContent   = d.rating || '';
  elDuration.textContent = d.duration || '';
  elDesc.textContent     = d.desc || '';

  elPlatform.style.display               = d.platform ? '' : 'none';
  elGenre.style.display                  = d.genres   ? '' : 'none';
  elDuration.parentElement.style.display = d.duration ? '' : 'none';
  trailerBtn.style.display               = currentTrailerUrl ? 'inline-flex' : 'none';

  trailerBox.classList.remove('is-visible');
  iframe.src = '';
  trailerBtn.innerHTML = '<img src="assets/icons/Play.svg" alt="" /> Ver Tráiler';

  actualizarBtnGuardar(itemId);

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}






  function buildCardFallback(itemId) {
  const li = document.querySelector(`li[data-item-id="${itemId}"]`);
  if (!li) return null;

  // Buscar trailer en los datos cargados (top-lista.js los guarda en ITEMS)
  let trailerUrl = '';
  if (window._ITEMS) {
    const found = window._ITEMS.find(i => i.id === itemId);
    if (found) trailerUrl = found.trailer || '';
  }

  return {
    title:       li.querySelector('.card__title')?.textContent?.trim()    || '',
    type:        li.querySelector('.card__type')?.textContent?.trim()     || '',
    genres:      li.querySelector('.card__genres')?.textContent?.trim()   || '',
    rating:      li.querySelector('.card__rating')?.textContent?.replace(/[^\d.]/g,'')?.trim() || '',
    duration:    li.querySelector('.card__duration')?.textContent?.trim() || '',
    platform:    li.querySelector('.platform-badge')?.textContent?.trim() || '',
    platformBadge: li.querySelector('.platform-badge')?.textContent?.trim() || '',
    desc:        li.querySelector('.card__desc')?.textContent?.trim()     || '',
    img:         li.querySelector('.card__thumb img')?.src                || '',
    trailerUrl,
  };
}


  /* ── CERRAR MODAL ── */
  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    iframe.src  = '';
    trailerOpen = false;
    trailerBox.classList.remove('is-visible');
    trailerBtn.innerHTML = '<img src="assets/icons/Play.svg" alt="" /> Ver Tráiler';
    currentItemId = null;
  }

  /* ── TRÁILER ── */
  trailerBtn.addEventListener('click', () => {
    if (!currentTrailerUrl) return;
    trailerOpen = !trailerOpen;
    if (trailerOpen) {
      iframe.src = currentTrailerUrl;
      trailerBox.classList.add('is-visible');
      trailerBtn.innerHTML = '<img src="assets/icons/Play.svg" alt="" /> Ocultar Tráiler';
    } else {
      iframe.src = '';
      trailerBox.classList.remove('is-visible');
      trailerBtn.innerHTML = '<img src="assets/icons/Play.svg" alt="" /> Ver Tráiler';
    }
  });

  /* ── GUARDAR DESDE EL MODAL ── */
  saveBtn.addEventListener('click', async () => {
  if (!currentItemId) return;

  if (!Auth.getUser()) {
    closeModal();
    AuthModal.open('login', () => openModal(currentItemId));
    return;
  }

  // Buscar datos
  let d = (typeof DATA !== 'undefined' && DATA[currentItemId]) ? DATA[currentItemId] : null;
  if (!d) {
    const catalogo = window.CATALOGO_COMPLETO || window._ITEMS || [];
    const found = catalogo.find(i => i.id === currentItemId);
    if (found) d = {
      title:    found.title,
      type:     found.type,
      genres:   Array.isArray(found.genres) ? found.genres.join(', ') : (found.genres || ''),
      rating:   String(found.rating || ''),
      desc:     found.desc || '',
      img:      found.img  || '',
      platform: found.platform || '',
      platformBadge: found.platform || '',
    };
  }
  if (!d) d = buildCardFallback(currentItemId);
  if (!d) return;

  if (window.Listas.estaEnHistorial(currentItemId)) return;

  if (window.Listas.estaGuardado(currentItemId)) {
    await window.Listas.quitar(currentItemId);
    actualizarBtnGuardar(currentItemId);
    sincronizarBtnTarjeta(currentItemId, false);
    showToast(`"${d.title}" quitado de Ver después`);
  } else {
    const item = {
      id:       currentItemId,
      title:    d.title,
      type:     d.type,
      genres:   d.genres,
      rating:   d.rating,
      desc:     d.desc,
      img:      d.img,
      platform: d.platformBadge || d.platform,
    };
    const resultado = await window.Listas.guardar(item);
    actualizarBtnGuardar(currentItemId);
    sincronizarBtnTarjeta(currentItemId, resultado === 'ok');
    if (resultado === 'ok') {
      showToast(`"${d.title}" agregado a Ver después`);
    } else if (resultado === 'duplicado') {
      showToast(`"${d.title}" ya está en tu lista`);
    }
  }
});





  /* Sincronizar el .btn-save de la tarjeta en la lista cuando se guarda desde el modal */
  function sincronizarBtnTarjeta(itemId, guardado) {
    const li  = document.querySelector(`li[data-item-id="${itemId}"]`);
    const btn = li?.querySelector('.btn-save');
    if (!btn) return;
    if (guardado) {
      btn.classList.add('is-saved');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('is-saved');
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  /* ── CERRAR MODAL eventos ── */
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  /* ── ABRIR MODAL al hacer clic en tarjeta ── */
  document.addEventListener('click', e => {
    if (e.target.closest('#modalOverlay')) return;
    const card = e.target.closest('.card');
    if (!card) return;
    if (e.target.closest('.btn-save')) return;
    const li = card.closest('li[data-item-id]');
    if (li?.dataset.itemId) openModal(li.dataset.itemId);
  });

  /* ── BOTÓN HERO "Ver Tráiler / Info" ── */
  document.addEventListener('click', e => {
    const trailerHeroBtn = e.target.closest('.btn-hero-primary');
    if (!trailerHeroBtn) return;
    e.preventDefault();
    openModal('breaking-bad');
  });

  /* ── BOTÓN HERO "Añadir a la lista" ── */
  // Reemplaza el listener de .btn-hero-primary:
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-hero-primary');
  if (!btn) return;
  e.preventDefault();
  const heroId = btn.dataset.heroId;
  if (heroId) openModal(heroId);
  else openModal('breaking-bad'); // fallback
});

// Reemplaza el listener de .btn-hero-secondary:
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-hero-secondary');
  if (!btn) return;

  if (!Auth.getUser()) {
    AuthModal.open('login');
    return;
  }

  const heroId = btn.dataset.heroId;
  if (!heroId) return;

  // Buscar el item en _ITEMS
  const item = window._ITEMS?.find(i => i.id === heroId);
  if (!item) return;

  if (window.Listas && window.Listas.estaGuardado(heroId)) {
    window.Listas.quitar(heroId);
    btn.innerHTML = '<img src="assets/icons/agregar.svg" alt="" class="btn-icon" /> Añadir a la lista';
    btn.classList.remove('is-saved');
  } else if (window.Listas) {
    window.Listas.guardar({
      id:       item.id,
      title:    item.title,
      type:     item.type,
      genres:   Array.isArray(item.genres) ? item.genres.join(', ') : item.genres,
      rating:   String(item.rating),
      desc:     item.desc,
      img:      item.img,
      platform: item.platform,
    });
    btn.innerHTML = '<img src="assets/icons/agregada.svg" alt="" class="btn-icon" /> Añadido ✓';
    btn.classList.add('is-saved');
  }
});

  /* ── TOAST ── */
  function showToast(msg) {
    let t = document.getElementById('modalToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'modalToast';
      t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#0F172B;border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:9999px;box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:9999;opacity:0;transition:opacity 0.25s,transform 0.25s;font-family:var(--font-main);white-space:nowrap;`;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; }, 2800);
  }

  /* ── EXPONER openModal globalmente por si se necesita ── */
  window.Modal = { open: openModal, close: closeModal };

})();