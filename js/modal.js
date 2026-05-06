/* ===================================================
   MODAL.JS — Modal de detalle de película / serie
   Se importa en todos los HTML que usen tarjetas
=================================================== */

(function () {
  'use strict';

  /* ── DATOS de cada tarjeta ──────────────────────────
     Deben coincidir con los IDs del filters.js.
     trailerUrl: ID del video de YouTube
  ─────────────────────────────────────────────────── */
  const DATA = {
    'breaking-bad': {
      title:      'Breaking Bad',
      type:       'Serie',
      genres:     'Crime, Drama',
      rating:     '9.5',
      duration:   '3 Temporadas',
      platform:   'Transmisión en Netflix',
      desc:       'Un profesor de química diagnosticado con cáncer terminal decide fabricar metanfetamina junto a un ex alumno para asegurar el futuro económico de su familia, mientras su doble vida lo arrastra a un mundo criminal sin retorno.',
      img:        'https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/HhesaQXLuRY?autoplay=1',
    },
    'game-of-thrones': {
      title:      'Game of Thrones',
      type:       'Serie',
      genres:     'Fantasy, Drama',
      rating:     '9.3',
      duration:   '8 Temporadas',
      platform:   'Transmisión en HBO Max',
      desc:       'Poderosas familias nobles luchan por el control del Trono de Hierro de los Siete Reinos de Westeros, mientras una antigua amenaza sobrenatural regresa desde más allá del muro del norte.',
      img:        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/KPLWWIOCOOQ?autoplay=1',
    },
    'interstellar': {
      title:      'Interstellar',
      type:       'Película',
      genres:     'Action, Sci-Fi',
      rating:     '9.2',
      duration:   '169 min',
      platform:   'Transmisión en HBO Max',
      desc:       'Un equipo de exploradores viaja a través de un agujero de gusano en los confines del universo para encontrar un nuevo hogar para la humanidad mientras la Tierra se extingue lentamente.',
      img:        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/zSWdZtXT7E?autoplay=1',
    },
    'stranger-things': {
      title:      'Stranger Things',
      type:       'Serie',
      genres:     'Sci-Fi, Mystery',
      rating:     '9.0',
      duration:   '4 Temporadas',
      platform:   'Transmisión en Netflix',
      desc:       'Un grupo de amigos en un pequeño pueblo de Indiana descubre fuerzas sobrenaturales, experimentos secretos del gobierno y una dimensión paralela aterradora que amenaza su mundo.',
      img:        'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU?autoplay=1',
    },
    'the-dark-knight': {
      title:      'The Dark Knight',
      type:       'Película',
      genres:     'Action, Thriller',
      rating:     '8.9',
      duration:   '152 min',
      platform:   'Transmisión en HBO Max',
      desc:       'Batman enfrenta a su mayor amenaza cuando el Joker, un agente del caos sin escrúpulos, desata el terror en Gotham City con un plan diseñado para destruir todo lo que el Caballero Oscuro representa.',
      img:        'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1',
    },
    'severance': {
      title:      'Severance',
      type:       'Serie',
      genres:     'Sci-Fi, Thriller',
      rating:     '8.7',
      duration:   '2 Temporadas',
      platform:   'Transmisión en Apple TV+',
      desc:       'Empleados de la misteriosa corporación Lumon se someten a un procedimiento quirúrgico que separa completamente sus recuerdos laborales de los personales, sin saber qué ocurre en la otra mitad de su vida.',
      img:        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/xEQP4VVuyrY?autoplay=1',
    },
    'dune': {
      title:      'Dune: Parte Uno',
      type:       'Película',
      genres:     'Sci-Fi, Adventure',
      rating:     '8.5',
      duration:   '155 min',
      platform:   'Transmisión en HBO Max',
      desc:       'Paul Atreides, un joven noble, viaja al planeta más peligroso del universo para asegurar el futuro de su familia y su pueblo, heredando el destino de quienes controlan la especia más valiosa de la galaxia.',
      img:        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/8g18jFHCLXk?autoplay=1',
    },
    'the-boys': {
      title:      'The Boys',
      type:       'Serie',
      genres:     'Action, Comedy',
      rating:     '8.4',
      duration:   '4 Temporadas',
      platform:   'Transmisión en Amazon Prime',
      desc:       'Un grupo de vigilantes sin poderes decide enfrentarse a un equipo de superhéroes corrompidos por la fama y el poder, respaldados por una megacorporación que los usa como herramienta de control.',
      img:        'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/M1bhOaLV4FU?autoplay=1',
    },
    'invincible': {
      title:      'Invincible',
      type:       'Serie',
      genres:     'Animation, Action',
      rating:     '8.3',
      duration:   '2 Temporadas',
      platform:   'Transmisión en Amazon Prime',
      desc:       'Mark Grayson es un adolescente normal cuyo padre es el superhéroe más poderoso del planeta. Al heredar sus poderes, descubre que la verdad detrás del legado familiar es mucho más oscura de lo que esperaba.',
      img:        'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/4RLSjBmkGT4?autoplay=1',
    },
    'dark': {
      title:      'Dark',
      type:       'Serie',
      genres:     'Sci-Fi, Mystery',
      rating:     '8.2',
      duration:   '3 Temporadas',
      platform:   'Transmisión en Netflix',
      desc:       'Cuatro familias interconectadas de un pequeño pueblo alemán se ven arrastradas a una conspiración que involucra viajes en el tiempo, paradojas imposibles y ciclos que se repiten a lo largo de décadas.',
      img:        'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
      trailerUrl: 'https://www.youtube.com/embed/rrwycJ08PSA?autoplay=1',
    },
  };

  function buildCardFallback(itemId) {
    const card = document.querySelector(`li[data-item-id="${itemId}"]`);
    if (!card) return null;

    const title = card.querySelector('.card__title')?.textContent?.trim() || '';
    const type = card.querySelector('.card__type')?.textContent?.trim() || '';
    const genres = card.querySelector('.card__genres')?.textContent?.trim() || '';
    const rating = card.querySelector('.card__rating')?.textContent?.trim() || '';
    const desc = card.querySelector('.card__desc')?.textContent?.trim() || '';
    const img = card.querySelector('.card__thumb img')?.src || '';
    const platform = card.querySelector('.platform-badge')?.textContent?.trim() || '';

    return {
      title,
      type,
      genres,
      rating,
      duration: '',
      platform,
      desc,
      img,
      trailerUrl: '',
    };
  }

  /* ── CREAR EL MODAL EN EL DOM ───────────────────── */
  const modalHTML = `
    <div class="modal-overlay" id="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="floating-card">

        <!-- Imagen izquierda -->
        <div class="modal-img-col">
          <img id="modalImg" src="" alt="" />
          <span class="modal-platform-badge" id="modalPlatform"></span>
        </div>

        <!-- Contenido derecho -->
        <div class="modal-content-col">

          <!-- Cerrar -->
          <button class="modal-close-btn" id="modalCloseBtn" aria-label="Cerrar">✕</button>

          <!-- Tags -->
          <div class="modal-tags">
            <span class="modal-tag-type" id="modalType"></span>
            <span class="modal-tag-genre" id="modalGenre"></span>
          </div>

          <!-- Título -->
          <h2 class="modal-title" id="modalTitle"></h2>

          <!-- Rating + Duración -->
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

          <!-- Descripción -->
          <p class="modal-desc" id="modalDesc"></p>

          <!-- Acciones -->
          <div class="modal-actions">
            <button class="btn-modal-primary" id="modalTrailerBtn">
              <img src="assets/icons/Play.svg" alt="" />
              Ver Tráiler
            </button>
            <button class="btn-modal-secondary" id="modalSaveBtn">
              <img src="assets/icons/agregar.svg" alt="" />
              Añadir a mi lista
            </button>
          </div>

          <!-- Tráiler embed -->
          <div class="modal-trailer" id="modalTrailer">
            <iframe id="modalIframe" src="" title="Tráiler" allowfullscreen allow="autoplay"></iframe>
          </div>

        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  /* ── REFERENCIAS ─────────────────────────────────── */
  const overlay     = document.getElementById('modalOverlay');
  const closeBtn    = document.getElementById('modalCloseBtn');
  const trailerBtn  = document.getElementById('modalTrailerBtn');
  const trailerBox  = document.getElementById('modalTrailer');
  const iframe      = document.getElementById('modalIframe');

  const elImg       = document.getElementById('modalImg');
  const elPlatform  = document.getElementById('modalPlatform');
  const elType      = document.getElementById('modalType');
  const elGenre     = document.getElementById('modalGenre');
  const elTitle     = document.getElementById('modalTitle');
  const elRating    = document.getElementById('modalRating');
  const elDuration  = document.getElementById('modalDuration');
  const elDesc      = document.getElementById('modalDesc');

  let currentTrailerUrl = '';
  let trailerOpen = false;

  function openModal(itemId) {
    const d = DATA[itemId] || buildCardFallback(itemId);
    if (!d) return;

    elImg.src         = d.img || '';
    elImg.alt         = d.title || '';
    elPlatform.textContent = d.platform || '';
    elType.textContent     = d.type || '';
    elGenre.textContent    = d.genres ? '• ' + d.genres : '';
    elTitle.textContent    = d.title || '';
    elRating.textContent   = d.rating || '';
    elDuration.textContent = d.duration || '';
    elDesc.textContent     = d.desc || '';

    elPlatform.style.display = d.platform ? '' : 'none';
    elGenre.style.display = d.genres ? '' : 'none';
    elDuration.parentElement.style.display = d.duration ? '' : 'none';

    currentTrailerUrl = d.trailerUrl || '';

    if (currentTrailerUrl) {
      trailerBtn.style.display = 'inline-flex';
    } else {
      trailerBtn.style.display = 'none';
      trailerBox.classList.remove('is-visible');
      trailerOpen = false;
      iframe.src = '';
    }

    trailerOpen = false;
    trailerBox.classList.remove('is-visible');
    iframe.src = '';
    trailerBtn.innerHTML = `<img src="assets/icons/Play.svg" alt="" /> Ver Tráiler`;

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    iframe.src = '';
    trailerOpen = false;
    trailerBox.classList.remove('is-visible');
    trailerBtn.innerHTML = `<img src="assets/icons/Play.svg" alt="" /> Ver Tráiler`;
  }

  trailerBtn.addEventListener('click', () => {
    if (!currentTrailerUrl) return;

    trailerOpen = !trailerOpen;

    if (trailerOpen) {
      iframe.src = currentTrailerUrl;
      trailerBox.classList.add('is-visible');
      trailerBtn.innerHTML = `<img src="assets/icons/Play.svg" alt="" /> Ocultar Tráiler`;
    } else {
      iframe.src = '';
      trailerBox.classList.remove('is-visible');
      trailerBtn.innerHTML = `<img src="assets/icons/Play.svg" alt="" /> Ver Tráiler`;
    }
  });

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#modalOverlay')) return;

    const card = e.target.closest('.card');
    if (!card) return;
    if (e.target.closest('.btn-save')) return;

    const li = card.closest('li[data-item-id]');
    const itemId = li?.dataset.itemId;
    if (itemId) openModal(itemId);
  });

})();
