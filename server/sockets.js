import {addMessage, getPendingMessages} from "./db.js";
import { verifyToken } from './config/jwt.js';

export default function socketHandler(io) {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        
        try {
            if (!token) {
                throw new Error('Authentication error: Token missing');
            }

            const decoded = await verifyToken(token);
            socket.user = decoded;
            
            // Guardar el token en el socket para futuras verificaciones
            socket.token = token;
            
            next();
        } catch (err) {
            const error = new Error(err.message || 'Authentication error');
            error.data = { type: 'auth_error' }; // Útil para el cliente
            next(error);
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.username}`);

        socket.on('disconnect', () => {
            console.log('a user has disconnected');
        });


        // Enviar mensajes pendientes si el socket no es recuperado
        if (!socket.recovered) {
            try {
                const pending = await getPendingMessages(socket.handshake.auth.serverOffset ?? 0);

                pending.forEach(row => {
                    socket.emit('chat message', {
                        id: row.id,
                        content: row.content,
                        created_at: row.created_at,
                        offset: row.offset,
                        username: row.username
                    });
                });
            } catch (error) {
                console.error("Error al obtener mensajes pendientes:", error);
                return;
            }
        }

        socket.on('chat message', async (msg) => {
               
                //Obtenemos el username del socket handshake
                const username = socket.handshake.auth.username ?? 'anonymous';
                let insertedMessage;

                try {
                  
                    insertedMessage = await addMessage(username, msg);
                    }  catch (error) {
                    console.error("Error al guardar mensaje:", error);
                    return;
                }

                // Emitimos el mensaje con UUID y offset al cliente
                io.emit('chat message', insertedMessage);
            });
        
    });
}