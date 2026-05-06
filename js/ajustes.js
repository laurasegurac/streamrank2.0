/* ===================================================
   AJUSTES.JS — Lógica de la página de ajustes
=================================================== */

(function () {
  'use strict';

  const noAuth    = document.getElementById('ajustesNoAuth');
  const inner     = document.getElementById('ajustesInner');
  const initial   = document.getElementById('ajustesInitial');
  const avatarImg = document.getElementById('ajustesAvatarImg');
  const photoInp  = document.getElementById('ajustesPhoto');
  const nameInp   = document.getElementById('ajustesUsername');
  const emailInp  = document.getElementById('ajustesEmail');
  const passInp   = document.getElementById('ajustesPassword');
  const feedback  = document.getElementById('ajustesFeedback');
  const saveBtn   = document.getElementById('ajustesSaveBtn');
  const logoutBtn = document.getElementById('ajustesLogoutBtn');

  /* Actualizar header */
  Auth.updateHeaderUI();

  function renderAuthState() {
    const user = Auth.getUser();
    if (!user) {
      noAuth.hidden = false;
      inner.hidden = true;
      return;
    }

    noAuth.hidden = true;
    inner.hidden = false;
    nameInp.value  = user.username || '';
    emailInp.value = user.email    || '';
    photoInp.value = user.photoUrl || '';
    updateAvatarPreview(user.photoUrl, user.username);
  }

  renderAuthState();
  window.addEventListener('auth:changed', renderAuthState);

  /* Preview de avatar en tiempo real */
  photoInp.addEventListener('input', () => {
    updateAvatarPreview(photoInp.value, nameInp.value);
  });

  function updateAvatarPreview(url, name) {
    if (url) {
      avatarImg.src = url;
      avatarImg.style.display = 'block';
      initial.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      initial.style.display = '';
      initial.textContent = (name || 'U').charAt(0).toUpperCase();
    }
  }

  /* Guardar cambios */
  saveBtn.addEventListener('click', () => {
    const username    = nameInp.value.trim();
    const photoUrl    = photoInp.value.trim();
    const newPassword = passInp.value;

    if (!username) {
      showFeedback('El nombre de usuario no puede estar vacío.', 'error');
      return;
    }

    const result = Auth.updateProfile({ username, photoUrl, newPassword: newPassword || undefined });

    if (!result.ok) {
      showFeedback(result.error, 'error');
      return;
    }

    passInp.value = '';
    updateAvatarPreview(photoUrl, username);
    Auth.updateHeaderUI();
    showFeedback('Perfil actualizado correctamente.', 'success');
  });

  /* Cerrar sesión */
  logoutBtn.addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'index.html';
  });

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = `ajustes-feedback is-${type}`;
    setTimeout(() => {
      feedback.className = 'ajustes-feedback';
    }, 3500);
  }

})();