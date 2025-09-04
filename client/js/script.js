import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

//Connect to server
const socket = io();

const form = document.querySelector('#messageForm');
const input = document.querySelector('#messageInput');
const messages = document.querySelector('#messages');

socket.on('chat message', (msg) => {
    const item = `<li>${msg}</li>`;        
    messages.insertAdjacentHTML('beforeend', item);
    messages.scrollTop = messages.scrollHeight; 
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});