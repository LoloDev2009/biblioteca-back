const fs = require("fs");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

// URL de tu backend remoto
const REMOTE_URL = "https://biblioteca-back-315x.onrender.com/api/libros";

// Archivo de backup
const BACKUP_FILE = "backup.json";

// Base de datos local
const db = new sqlite3.Database("biblioteca.db");

// 1️⃣ Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS libros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn TEXT UNIQUE,
    titulo TEXT,
    autor TEXT,
    editorial TEXT,
    año TEXT,
    portada_url TEXT,
    edited BOOL
  )`);
});

// 2️⃣ Función para hacer backup
async function hacerBackup() {
  try {
    const response = await axios.get(REMOTE_URL);
    const libros = response.data;

    // Guardar en JSON local
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(libros, null, 2), "utf-8");
    console.log(`✅ Backup guardado en ${BACKUP_FILE} (${libros.length} libros)`);

    // Guardar en la base de datos local
    const stmt = db.prepare(`INSERT OR IGNORE INTO libros
      (isbn, titulo, autor, editorial, año, portada_url)
      VALUES (?, ?, ?, ?, ?, ?)`);

    libros.forEach(libro => {
      if (libro.edited == "True"){
        db.run(`DELETE FROM libros WHERE isbn = ?`,(libro.isbn))
      }
      stmt.run(
        libro.isbn,
        libro.titulo,
        libro.autor,
        libro.editorial,
        libro.año,
        libro.portada_url,
        null
      );
      console.log(libro.titulo)
    });

    stmt.finalize();
    console.log("✅ Datos guardados en la base de datos local");

  } catch (err) {
    console.error("❌ Error al hacer backup:", err.message);
  } finally {
    db.close();
  }
}

// Ejecutar backup
hacerBackup();
