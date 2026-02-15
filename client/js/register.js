
const form = document.querySelector('#registerForm');
const messageDiv = document.querySelector('#message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  // Limpiar mensaje anterior
  messageDiv.style.display = 'none';
  messageDiv.textContent = '';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token); 
      localStorage.setItem('username', data.user.username);
      window.location.href = '/chat.html';
    } else {
      // Mostrar errores de validación o del backend
      if (data.errors && Array.isArray(data.errors)) {
        messageDiv.textContent = data.errors.map(e => e.message).join(' | ');
      } else {
        messageDiv.textContent = data.error || 'Registro fallido';
      }
      messageDiv.style.display = 'block';
    }
  } catch (err) {
    console.error(err);
    messageDiv.textContent = 'Error de conexión';
    messageDiv.style.display = 'block';
  }
});
