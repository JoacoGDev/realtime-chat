import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

// Si no hay token, redirigimos al login
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token || !username) {
    window.location.href = '/login.html';
}

// Estado de conexión
const connectionStatus = document.getElementById('connectionStatus');

const updateConnectionStatus = (connected) => {
    connectionStatus.textContent = connected ? 'Conectado' : 'Desconectado';
    connectionStatus.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
};

const formatDate = (timestamp) => {
    const date = new Date(typeof timestamp === "number" ? timestamp * 1000 : timestamp);
    return date.toLocaleTimeString([], { 
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};


// Configuración de la URL del servidor
const socketUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : window.location.origin;

// Conexión al servidor con username y token en auth
const socket = io(socketUrl, {
    auth: {
        username,
        token,
        serverOffset: 0
    }
});

const form = document.querySelector('#messageForm');
const input = document.querySelector('#messageInput');
const messages = document.querySelector('#messages');
const logoutBtn = document.querySelector('#logoutBtn');

// Eventos de conexión
socket.on('connect', () => {
    updateConnectionStatus(true);
    console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
    updateConnectionStatus(false);
    console.log('Desconectado del servidor');
});

socket.on('connect_error', (error) => {
    updateConnectionStatus(false);
    if (error.message.includes('Authentication error')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
    }
});

// Eventos de mensajes
socket.on('chat message', ({content, created_at, serverOffset, username: msgUsername}) => {
    const isOwnMessage = username === msgUsername;
    
    const messageHtml = `
        <div class="message ${isOwnMessage ? 'own' : ''}">
            ${!isOwnMessage ? `<div class="message-header">${msgUsername}</div>` : ''}
            <div class="message-text">${content}</div>
            <div class="message-time">${formatDate(created_at)}</div>
        </div>
    `;
    
    messages.insertAdjacentHTML('beforeend', messageHtml);
    messages.scrollTop = messages.scrollHeight;
    socket.auth.serverOffset = serverOffset;
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

// Logout (podés agregar un botón con id logoutBtn en chat.html)


    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
    });


