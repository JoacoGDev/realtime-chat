import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import logger from 'morgan';
import socketHandler from './sockets.js';


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

socketHandler(io);



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
