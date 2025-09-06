import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';

dotenv.config();

//Conexión a la base de datos
export const db = createClient({
    url: "libsql://amazed-tara-joacogdev.aws-us-east-1.turso.io",
    authToken: process.env.DB_TOKEN
})


export async function insertUser(username, passwordHash){
    const id = uuidv4();

    await db.execute({
        sql: `INSERT INTO users (id, username, password_hash) VALUES (:id, :username, :password_hash)`,
        args: { id, username, password_hash: passwordHash },
    })

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

export async function addMessage(username, content){
     
    const newId = uuidv4();

    await db.execute({
        sql: `INSERT INTO messages (id, content, username) VALUES (:id, :content, :username)`,
        args: { id: newId, content, username },
    });

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
