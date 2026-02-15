import {addMessage, getPendingMessages} from "./db.js";
import { verifyToken } from './config/jwt.js';
import sanitizeHtml from 'sanitize-html';

export default function socketHandler(io) {
    // Mapa para trackear intentos de reconexión por usuario
    const reconnectAttempts = new Map();
    const MAX_RECONNECT_ATTEMPTS = 5;

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        
        try {
            if (!token) {
                throw new Error('Token no proporcionado');
            }

            const decoded = await verifyToken(token);
            socket.user = decoded;
            socket.token = token;

            // Resetear intentos de reconexión al conectarse exitosamente
            reconnectAttempts.delete(decoded.username);
            
            next();
        } catch (err) {
            const error = new Error('Error de autenticación');
            error.data = { 
                type: 'auth_error',
                message: err.message 
            };
            next(error);
        }
    });

    io.on('connection', async (socket) => {
        console.log(`Usuario conectado: ${socket.user.username}`);

        // Manejo de desconexión
        socket.on('disconnect', (reason) => {
            const username = socket.user.username;
            console.log(`Usuario desconectado (${username}): ${reason}`);

            // Incrementar intentos de reconexión
            const attempts = reconnectAttempts.get(username) || 0;
            if (attempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts.set(username, attempts + 1);
            }
        });

        // Recuperación de mensajes
        if (!socket.recovered) {
            try {
                const serverOffset = socket.handshake.auth.serverOffset || 0;
                const pending = await getPendingMessages(serverOffset);

                for (const message of pending) {
                    socket.emit('chat message', {
                        ...message,
                        recovered: true
                    });
                }
            } catch (error) {
                socket.emit('error', {
                    type: 'recovery_error',
                    message: 'Error al recuperar mensajes'
                });
            }
        }

        // Manejo de mensajes
        socket.on('chat message', async (msg) => {
            const username = socket.user.username;
            
            // Validar mensaje
            if (typeof msg !== 'string' || msg.length > 500) {
                socket.emit('error', {
                    type: 'validation_error',
                    message: 'Mensaje inválido'
                });
                return;
            }

            try {
                const sanitizedMsg = sanitizeHtml(msg.trim(), {
                    allowedTags: [],
                    allowedAttributes: {}
                });

                const insertedMessage = await addMessage(username, sanitizedMsg);
                
                io.emit('chat message', {
                    ...insertedMessage,
                    recovered: false
                });
            } catch (error) {
                console.error("Error al guardar mensaje:", error);
                socket.emit('error', {
                    type: 'database_error',
                    message: 'Error al enviar mensaje'
                });
            }
        });

        // Manejo de reconexión
        socket.on('reconnect_attempt', () => {
            const username = socket.user.username;
            const attempts = reconnectAttempts.get(username) || 0;

            if (attempts >= MAX_RECONNECT_ATTEMPTS) {
                socket.emit('error', {
                    type: 'reconnect_error',
                    message: 'Demasiados intentos de reconexión'
                });
                reconnectAttempts.delete(username);
            }
        });
    });
}