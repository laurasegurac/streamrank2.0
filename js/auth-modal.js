/* ===================================================
   AUTH-MODAL.JS
   Modal de login / registro. Se incluye en todas
   las páginas junto a auth.js.
   
   Uso:
     AuthModal.open()         → abre en modo login
     AuthModal.open('register') → abre en modo registro
=================================================== */

const AuthModal = (function () {
  'use strict';

  /* ── INYECTAR HTML DEL MODAL ── */
  const html = `
    <div class="auth-overlay" id="authOverlay" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <div class="auth-card">

        <button class="auth-close" id="authClose" aria-label="Cerrar">✕</button>

        <h2 class="auth-title" id="authTitle">Bienvenido de nuevo</h2>
        <p class="auth-subtitle" id="authSubtitle">Ingresa tus credenciales para acceder a tu cuenta.</p>

        <form class="auth-form" id="authForm" novalidate>

          <div class="auth-field">
            <label for="authEmail" class="auth-label">Correo electrónico</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="12" height="9" rx="1.5"/>
                <path d="M2 4.5l6 4.5 6-4.5"/>
              </svg>
              <input class="auth-input" id="authEmail" type="email"
                     placeholder="tu@correo.com" autocomplete="email" required />
            </div>
          </div>

          <div class="auth-field">
            <label for="authPassword" class="auth-label">Contraseña</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="7" width="10" height="7" rx="1.5"/>
                <path d="M5 7V5a3 3 0 0 1 6 0v2"/>
              </svg>
              <input class="auth-input" id="authPassword" type="password"
                     placeholder="••••••••" autocomplete="current-password" required />
            </div>
          </div>

          <div class="auth-error" id="authError"></div>

          <button class="auth-submit" id="authSubmit" type="submit">Ingresar</button>

        </form>

        <div class="auth-switch" id="authSwitch">
          ¿No tienes cuenta?
          <button type="button" id="authToggle">Regístrate aquí</button>
        </div>

      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  /* ── REFERENCIAS ── */
  const overlay   = document.getElementById('authOverlay');
  const closeBtn  = document.getElementById('authClose');
  const title     = document.getElementById('authTitle');
  const subtitle  = document.getElementById('authSubtitle');
  const form      = document.getElementById('authForm');
  const emailInp  = document.getElementById('authEmail');
  const passInp   = document.getElementById('authPassword');
  const errorEl   = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmit');
  const toggle    = document.getElementById('authToggle');
  const switchEl  = document.getElementById('authSwitch');

  let mode = 'login'; // 'login' | 'register'
  let pendingAction = null; // función a ejecutar tras login exitoso

  /* ── CAMBIAR MODO ── */
  function setMode(m) {
    mode = m;
    hideError();

    if (mode === 'login') {
      title.textContent    = 'Bienvenido de nuevo';
      subtitle.textContent = 'Ingresa tus credenciales para acceder a tu cuenta.';
      submitBtn.textContent = 'Ingresar';
      switchEl.innerHTML   = '¿No tienes cuenta? <button type="button" id="authToggle">Regístrate aquí</button>';
    } else {
      title.textContent    = 'Crear una cuenta';
      subtitle.textContent = 'Regístrate por primera vez con tu correo electrónico.';
      submitBtn.textContent = 'Registrarse';
      switchEl.innerHTML   = '¿Ya tienes cuenta? <button type="button" id="authToggle">Ingresa aquí</button>';
    }

    /* Re-vincular el nuevo botón toggle */
    document.getElementById('authToggle').addEventListener('click', () => {
      setMode(mode === 'login' ? 'register' : 'login');
    });
  }

  /* ── ERRORES ── */
  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('is-visible');
  }

  function hideError() {
    errorEl.classList.remove('is-visible');
    errorEl.textContent = '';
  }

  /* ── ABRIR ── */
  function open(initialMode = 'login', onSuccess = null) {
    mode = initialMode;
    pendingAction = onSuccess;
    setMode(mode);
    form.reset();
    hideError();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => emailInp.focus(), 100);
  }

  /* ── CERRAR ── */
  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    form.reset();
    hideError();
  }

  /* ── SUBMIT ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError();

    const email    = emailInp.value.trim();
    const password = passInp.value;

    if (!email || !password) {
      showError('Por favor completa todos los campos.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando…';

    /* Pequeño timeout para simular latencia de red */
    setTimeout(() => {
      const result = mode === 'login'
        ? Auth.login(email, password)
        : Auth.register(email, password);

      submitBtn.disabled = false;
      setMode(mode); // restaura texto del botón

      if (!result.ok) {
        showError(result.error);
        return;
      }

      /* Éxito — actualizar UI del header */
      close();
      Auth.updateHeaderUI();
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: result.user } }));

      /* Ejecutar acción pendiente (ej: guardar película) */
      if (typeof pendingAction === 'function') {
        pendingAction(result.user);
      }

      /* Mostrar toast de bienvenida */
      showToast(
        mode === 'register'
          ? `¡Bienvenido, ${result.user.username}!`
          : `¡Hola de nuevo, ${result.user.username}!`
      );

    }, 400);
  });

  /* ── TOGGLE LOGIN ↔ REGISTRO ── */
  toggle.addEventListener('click', () => {
    setMode(mode === 'login' ? 'register' : 'login');
  });

  /* ── CERRAR ── */
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  /* ── TOAST SIMPLE ── */
  function showToast(msg) {
    let toast = document.getElementById('authToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'authToast';
      toast.style.cssText = `
        position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
        background: #0F172B; border: 1px solid rgba(255,255,255,0.12);
        color: #fff; font-size: 14px; font-weight: 600;
        padding: 12px 24px; border-radius: 9999px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        z-index: 700; opacity: 0;
        transition: opacity 0.25s ease, transform 0.25s ease;
        font-family: var(--font-main);
        white-space: nowrap;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 3000);
  }

  /* ── CONECTAR BOTÓN "INGRESAR" DEL HEADER ── */
  document.addEventListener('click', (e) => {
    const cta = e.target.closest('.btn-cta');
    if (cta) {
      e.preventDefault();
      open('login');
    }
  });

  /* ── CONECTAR BOTONES "GUARDAR" Y PUNTOS DE ACCIÓN QUE REQUIEREN SESIÓN ── */
  document.addEventListener('click', (e) => {
    const authBtn = e.target.closest('.btn-save, .btn-hero-primary, .btn-modal-secondary');
    if (!authBtn) return;

    const user = Auth.getUser();
    if (user) return; /* sesión activa, la acción normal sigue */

    e.preventDefault();
    e.stopImmediatePropagation();
    open('register', () => {
      authBtn.click();
    });
  });

  return { open, close };

})();