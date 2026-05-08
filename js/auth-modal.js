/* ===================================================
   AUTH-MODAL.JS
   Modal de login / registro.
   
   Uso:
     AuthModal.open()             → abre en modo login
     AuthModal.open('register')   → abre en modo registro
=================================================== */

const AuthModal = (function () {
  'use strict';

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

  let mode = 'login';
  let pendingAction = null;

  function setMode(m) {
    mode = m;
    hideError();
    if (mode === 'login') {
      title.textContent     = 'Bienvenido de nuevo';
      subtitle.textContent  = 'Ingresa tus credenciales para acceder a tu cuenta.';
      submitBtn.textContent = 'Ingresar';
      switchEl.innerHTML    = '¿No tienes cuenta? <button type="button" id="authToggle">Regístrate aquí</button>';
    } else {
      title.textContent     = 'Crear una cuenta';
      subtitle.textContent  = 'Regístrate por primera vez con tu correo electrónico.';
      submitBtn.textContent = 'Registrarse';
      switchEl.innerHTML    = '¿Ya tienes cuenta? <button type="button" id="authToggle">Ingresa aquí</button>';
    }
    document.getElementById('authToggle').addEventListener('click', () => {
      setMode(mode === 'login' ? 'register' : 'login');
    });
  }

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('is-visible'); }
  function hideError()    { errorEl.classList.remove('is-visible'); errorEl.textContent = ''; }

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

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    form.reset();
    hideError();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    hideError();

    const email    = emailInp.value.trim();
    const password = passInp.value;

    if (!email || !password) { showError('Por favor completa todos los campos.'); return; }

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Procesando…';

    setTimeout(() => {
      const result = mode === 'login'
        ? Auth.login(email, password)
        : Auth.register(email, password);

      submitBtn.disabled = false;
      setMode(mode);

      if (!result.ok) { showError(result.error); return; }

      close();
      Auth.updateHeaderUI();
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: result.user } }));

      if (typeof pendingAction === 'function') pendingAction(result.user);

      showToast(
        mode === 'register'
          ? `¡Bienvenido, ${result.user.username}!`
          : `¡Hola de nuevo, ${result.user.username}!`
      );
    }, 400);
  });

  toggle.addEventListener('click', () => setMode(mode === 'login' ? 'register' : 'login'));

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  /* ── Botón "Ingresar" del header ── */
  document.addEventListener('click', e => {
    const cta = e.target.closest('.btn-cta');
    if (!cta) return;
    e.preventDefault();
    open('login');
  });

  /* ── Botones que requieren sesión ──
     NOTA: .btn-modal-secondary y .btn-hero-secondary los maneja modal.js
     Aquí solo interceptamos .btn-save cuando NO hay sesión
  ── */
  document.addEventListener('click', e => {
    const saveBtn = e.target.closest('.btn-save');
    if (!saveBtn) return;
    if (Auth.getUser()) return; // sesión activa → listas.js lo maneja

    e.preventDefault();
    e.stopImmediatePropagation();
    open('login', () => {
      // Tras login, re-disparar el click en el botón
      setTimeout(() => saveBtn.click(), 100);
    });
  });

  function showToast(msg) {
    let toast = document.getElementById('authToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'authToast';
      toast.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#0F172B;border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:9999px;box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:700;opacity:0;transition:opacity 0.25s,transform 0.25s;font-family:var(--font-main);white-space:nowrap;`;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => { toast.style.opacity='1'; toast.style.transform='translateX(-50%) translateY(0)'; });
    setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateX(-50%) translateY(10px)'; }, 3000);
  }

  return { open, close };

})();