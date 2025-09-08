const form = document.querySelector('#registerForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token); // Guardamos el JWT
      localStorage.setItem('username', data.user.username);
      window.location.href = '/chat.html';
    } else {
      alert(data.error || 'Registro fallido');
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión');
  }
});
