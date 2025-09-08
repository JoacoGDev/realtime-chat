const form = document.querySelector('#registerForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('token', data.token); // Guardamos el JWT
    window.location.href = '/index.html';
  } else {
    alert('Registro fallido');
  }
});
