import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import {createClient} from '@libsql/client'
import logger from 'morgan';
import { v4 as uuidv4 } from 'uuid';


import {Server} from 'socket.io';
import { createServer } from 'node:http';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();


const port = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app);
const io  = new Server(server, {
    connectionStateRecovery: {}
});

const db = createClient({
    url: "libsql://amazed-tara-joacogdev.aws-us-east-1.turso.io",
    authToken: process.env.DB_TOKEN
})

await db.execute(`
CREATE TABLE IF NOT EXISTS messages (
    offset INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT UNIQUE,                
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username TEXT
);


`)

io.on('connection', async (socket) => {
    console.log('a user has connected!');

    socket.on('disconnect', () => {
        console.log('a user has disconnected');
    });

    socket.on('chat message', async (msg) => {
        const newId = uuidv4();
        let insertedMessage;

        //Obtenemos el username del socket handshake
        const username = socket.handshake.auth.username ?? 'anonymous';

        try {
      

            // Insertamos el mensaje con UUID
            await db.execute({
                sql: `INSERT INTO messages (id, content, username) VALUES (:id, :content, :username)`,
                args: { id: newId, content: msg, username: username }
            });

            // Recuperamos el mensaje insertado para obtener el offset generado
            const res = await db.execute({
                sql: `SELECT offset, id, content, created_at, username 
                      FROM messages 
                      WHERE id = :id`,
                args: { id: newId }
            });

            insertedMessage = res.rows[0]; // mensaje completo con offset

        } catch (error) {
            console.error("Error al guardar mensaje:", error);
            return;
        }

        // Emitimos el mensaje con UUID y offset al cliente
        io.emit('chat message', insertedMessage);
    });

    if (!socket.recovered) {
        try {
            const results = await db.execute({
                sql: `SELECT offset, id, content, created_at, username 
                      FROM messages 
                      WHERE offset > :offset
                      ORDER BY offset ASC`,
                args: {offset: socket.handshake.auth.serverOffset ?? 0}
            });

            results.rows.forEach(row => {
                socket.emit('chat message', {
                    id: row.id,
                    content: row.content,
                    created_at: row.created_at,
                    offset: row.offset,
                    username: row.username
                });
            });



        } catch (error) {
            console.error(error);
            return;
        }
    }
});

app.use(logger('dev'));

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});


server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
