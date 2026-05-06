/* ===================================================
   AUTH.JS — Lógica central de autenticación
   Usa localStorage como simulación de backend.
   Para conectar a Firebase/Supabase: reemplaza las
   funciones auth_login, auth_register y auth_logout.
=================================================== */

const Auth = (function () {
  'use strict';

  const USER_KEY = 'streamrank_user';
  const USERS_KEY = 'streamrank_users'; // "base de datos" simulada

  /* ── OBTENER USUARIO ACTUAL ── */
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

  /* ── OBTENER TODOS LOS USUARIOS REGISTRADOS ── */
  function getUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  /* ── LOGIN ───────────────────────────────────────
     Retorna { ok: true, user } o { ok: false, error }
     → Para backend: reemplaza con fetch('/api/login')
  ─────────────────────────────────────────────────*/
  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) return { ok: false, error: 'No existe una cuenta con ese correo.' };
    if (user.password !== password) return { ok: false, error: 'Contraseña incorrecta.' };

    const sessionUser = { id: user.id, username: user.username, email: user.email, photoUrl: user.photoUrl || '' };
    setUser(sessionUser);
    return { ok: true, user: sessionUser };
  }

  /* ── REGISTRO ────────────────────────────────────
     → Para backend: reemplaza con fetch('/api/register')
  ─────────────────────────────────────────────────*/
  function register(email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email.toLowerCase())) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
    }

    const newUser = {
      id:       Math.random().toString(36).slice(2, 11),
      email:    email.toLowerCase(),
      username: email.split('@')[0],
      password, // ⚠️ solo simulación — en backend nunca guardes la contraseña en plano
      photoUrl: '',
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = { id: newUser.id, username: newUser.username, email: newUser.email, photoUrl: '' };
    setUser(sessionUser);
    return { ok: true, user: sessionUser };
  }

  /* ── LOGOUT ── */
  function logout() {
    localStorage.removeItem(USER_KEY);
  }

  /* ── ACTUALIZAR PERFIL ── */
  function updateProfile({ username, photoUrl, newPassword }) {
    const current = getUser();
    if (!current) return { ok: false, error: 'No hay sesión activa.' };

    const users = getUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' };

    if (username)  users[idx].username = username;
    if (photoUrl !== undefined) users[idx].photoUrl = photoUrl;
    if (newPassword) users[idx].password = newPassword;

    saveUsers(users);

    const updated = { ...current, username: users[idx].username, photoUrl: users[idx].photoUrl };
    setUser(updated);
    return { ok: true, user: updated };
  }

  /* ── ACTUALIZAR HEADER SEGÚN SESIÓN ─────────────
     Llama esta función en cada página al cargar.
  ─────────────────────────────────────────────────*/
  function updateHeaderUI() {
    const user = getUser();
    const btnCta = document.querySelector('.btn-cta');
    if (!btnCta) return;

    if (user) {
      /* Reemplazar botón "Ingresar" por avatar + nombre + logout */
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
    /* Si no hay sesión, el botón "Ingresar" queda como está */
  }

  /* API pública */
  return { getUser, login, register, logout, updateProfile, updateHeaderUI };

})();