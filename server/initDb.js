import db from "./db.js";

async function init() {
  try {
    // Crear tabla de mensajes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        username TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s','now')),
        offset INTEGER AUTOINCREMENT
      );
    `);

    // // Crear tabla de usuarios (para más adelante)
    // await db.execute(`
    //   CREATE TABLE IF NOT EXISTS users (
    //     id TEXT PRIMARY KEY,
    //     username TEXT UNIQUE NOT NULL,
    //     password_hash TEXT NOT NULL,
    //     created_at INTEGER DEFAULT (strftime('%s','now'))
    //   );
    // `);

    console.log("Tablas creadas correctamente");
  } catch (err) {
    console.error("Error al inicializar la DB:", err);
  }
}

init();
