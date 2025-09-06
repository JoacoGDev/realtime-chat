import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';

dotenv.config();

//Conexión a la base de datos
const db = createClient({
    url: "libsql://amazed-tara-joacogdev.aws-us-east-1.turso.io",
    authToken: process.env.DB_TOKEN
})


export async function insertUser(username, passwordHash){
    const id = uuidv4();

    
    await db.execute({
        sql: `INSERT INTO users (id, username, password_hash) VALUES (:id, :username, :password_hash)`,
        args: { id, username, password_hash: passwordHash },
    })

     return { id, username };
}

export async function findUserByUsername(username) {
    const res = await db.execute({
        sql: `SELECT *
              FROM users 
              WHERE username = :username`,
        args: { username },
    });

    return res.rows[0];
}

export async function findUsername(username) {
    const res = await db.execute({
        sql: `SELECT username
              FROM users 
              WHERE username = :username`,
        args: { username },
    });

    return res.rows[0];
}


export async function addMessage(username, content) {
    // Obtener el último offset
    const last = await db.execute({
        sql: `SELECT MAX(offset) as lastOffset FROM messages`
    });
    const nextOffset = (last.rows[0].lastOffset ?? 0) + 1;

    const newId = uuidv4();

    // Insertar el mensaje con offset
    await db.execute({
        sql: `INSERT INTO messages (id, content, username, offset) VALUES (:id, :content, :username, :offset)`,
        args: { id: newId, content, username, offset: nextOffset },
    });

    // Recuperar el mensaje insertado
    const res = await db.execute({
        sql: `SELECT offset, id, content, created_at, username 
              FROM messages 
              WHERE id = :id`,
        args: { id: newId },
    });

    return res.rows[0];
}

export async function getPendingMessages(offset = 0) {
    const res = await db.execute({
        sql: `SELECT offset, id, content, created_at, username 
              FROM messages 
              WHERE offset > :offset
              ORDER BY offset ASC`,
        args: { offset },
    });

    return res.rows;
}

export default db;