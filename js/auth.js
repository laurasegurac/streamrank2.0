/* ===================================================
   AUTH.JS — Conectado al backend Node.js
   API: http://localhost:3000
=================================================== */

const Auth = (function () {
  'use strict';

  const USER_KEY  = 'streamrank_user';
  const API_URL   = 'http://localhost:3000';

  /* ── OBTENER USUARIO ACTUAL (sesión local) ── */
  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  /* ── GUARDAR SESIÓN ── */
  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /* ── LOGIN → POST /api/login ── */
  async function login(email, password) {
    try {
      const res  = await fetch(`${API_URL}/api/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await res.json();

      if (!data.ok) return { ok: false, error: data.error || 'Error al iniciar sesión.' };

      const sessionUser = {
        id:       data.data.id,
        username: data.data.username,
        email:    data.data.email,
        photoUrl: '',
      };
      setUser(sessionUser);
      return { ok: true, user: sessionUser };

    } catch (err) {
      return { ok: false, error: 'No se pudo conectar al servidor. ¿Está corriendo el back?' };
    }
  }

  /* ── REGISTRO → POST /api/users ── */
  async function register(email, password) {
    try {
      const res  = await fetch(`${API_URL}/api/users`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    email.toLowerCase(),
          password,
          username: email.split('@')[0],
        }),
      });

      const data = await res.json();

      if (!data.ok) return { ok: false, error: data.error || 'Error al registrarse.' };

      const sessionUser = {
        id:       data.data.id,
        username: data.data.username,
        email:    data.data.email,
        photoUrl: '',
      };
      setUser(sessionUser);
      return { ok: true, user: sessionUser };

    } catch (err) {
      return { ok: false, error: 'No se pudo conectar al servidor. ¿Está corriendo el back?' };
    }
  }

  /* ── LOGOUT ── */
  function logout() {
    localStorage.removeItem(USER_KEY);
  }

  /* ── ACTUALIZAR PERFIL → PUT /api/users/:id ── */
  async function updateProfile({ username, photoUrl, newPassword }) {
    const current = getUser();
    if (!current) return { ok: false, error: 'No hay sesión activa.' };

    try {
      const body = {};
      if (username)    body.username = username;
      if (newPassword) body.password = newPassword;
      if (photoUrl !== undefined) body.photoUrl = photoUrl;

      const res  = await fetch(`${API_URL}/api/users/${current.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.ok) return { ok: false, error: data.error };

      const updated = {
        ...current,
        username: data.data.username || current.username,
        photoUrl: photoUrl !== undefined ? photoUrl : current.photoUrl,
      };
      setUser(updated);
      return { ok: true, user: updated };

    } catch (err) {
      return { ok: false, error: 'No se pudo conectar al servidor.' };
    }
  }

  /* ── ACTUALIZAR HEADER SEGÚN SESIÓN ── */
  function updateHeaderUI() {
    const user   = getUser();
    const btnCta = document.querySelector('.btn-cta');
    if (!btnCta) return;

    if (user) {
      const initial = (user.username || user.email).charAt(0).toUpperCase();
      btnCta.outerHTML = `
        <div class="header-user" id="headerUser">
          <a href="ajustes.html" class="header-user__info" aria-label="Ajustes de cuenta">
            <div class="header-user__avatar" aria-hidden="true">
              ${user.photoUrl
                ? `<img src="${user.photoUrl}" alt="${user.username}" />`
                : `<span>${initial}</span>`}
            </div>
            <span class="header-user__name">${user.username}</span>
          </a>
          <button class="header-user__logout" id="headerLogoutBtn" aria-label="Cerrar sesión">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>
              <path d="M10 11l3-3-3-3"/>
              <path d="M13 8H6"/>
            </svg>
          </button>
        </div>`;

      document.getElementById('headerLogoutBtn')?.addEventListener('click', () => {
        logout();
        window.location.reload();
      });
    }
  }

  /* API pública */
  return { getUser, login, register, logout, updateProfile, updateHeaderUI };

})();