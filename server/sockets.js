import {addMessage, getPendingMessages} from "./db.js";

export default function socketHandler(io) {
    io.on('connection', async (socket) => {
        console.log('Se ha conectado un usuario!', socket.id);

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