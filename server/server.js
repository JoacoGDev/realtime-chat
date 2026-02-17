import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from 'morgan';
import socketHandler from './sockets.js';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import { init } from './initDb.js';
import { authLimiter } from './middleware/rateLimiter.js';

dotenv.config();

// Verificar variables de entorno críticas
const requiredEnvVars = ['DB_TOKEN', 'DB_URL', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is not set in environment variables`);
        process.exit(1);
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT ?? 3000;

//middleware
app.use(logger('dev'));
app.use(express.json()); // permite leer JSON en req.body


// Rutas de API con Rate Limiting
app.use('/api/auth', authLimiter, authRouter);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Redirigir a index por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'login.html'));
});




const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}
});

socketHandler(io);

// Inicializar base de datos y luego levantar el servidor
(async () => {
    try {   
        await init(); // Crear tablas si no existen
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error("Error inicializando la base de datos:", err);
    }
})();

