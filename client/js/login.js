const form = document.querySelector("#loginForm");
const error = document.querySelector("#error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch('/api/auth/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.error || "Error al iniciar sesión";
      return;
    }

    // Guardamos el token y el usuario en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);

    // Redirigir al chat
    window.location.href = "/chat.html";
  } catch (err) {
    error.textContent = "Error de conexión con el servidor";
    console.error(err);
  }
});
