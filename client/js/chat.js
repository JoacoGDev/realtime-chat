import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';


// Verificar si el usuario está autenticado
const token = localStorage.getItem('token');
if (!token) {
  // Si no hay token -> redirige a login
  window.location.href = '/login.html';
}

const formatDate = (timestamp) => {
  // Si viene como número (segundos), lo pasamos a milisegundos
  const date = new Date(typeof timestamp === "number" ? timestamp * 1000 : timestamp);

  return date.toLocaleTimeString([], { 
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};

const getUsername = async () => {
    const username = localStorage.getItem('username'); 

    if (username) {
        console.log(`User existed ${username}`);
        return username;
    }
  // Pedimos un username aleatorio a la API
    const res = await fetch('https://randomuser.me/api/');
    const data = await res.json();

    // Extraemos el username correctamente
    const randomUsername = data.results[0].login.username;


    localStorage.setItem('username', randomUsername);
    return randomUsername;

}

//Connect to server
const socket = io({
    auth: {
        username: await getUsername(),
        serverOffset: 0 
        
    }
});

const form = document.querySelector('#messageForm');
const input = document.querySelector('#messageInput');
const messages = document.querySelector('#messages');

socket.on('chat message', ({content, created_at, serverOffset, username}) => {

   
    const item = `<li><small>[${formatDate(created_at)}]</small> <p>${content}</p> 
    <small>${username}</small>
    </li>`;
    messages.insertAdjacentHTML('beforeend', item);
    messages.scrollTop = messages.scrollHeight; 
    socket.auth.serverOffset = serverOffset;
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

