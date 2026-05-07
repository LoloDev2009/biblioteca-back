import axios from "axios";
import sqlite3 from "sqlite3";
import fs from "fs";

// URL de tu backend remoto
const REMOTE_URL = "https://biblioteca-back-315x.onrender.com/api/libro/backup";

// Archivo de backup
const BACKUP_FILE = "src/db/backup.json";

// Base de datos local
const db = new sqlite3.Database("src/db/biblioteca.db");

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
    estado TEXT,
    descripcion TEXT,
    paginas INTEGER,
    genero TEXT,
    idioma TEXT,
    saga TEXT,
    resena TEXT,
    puntuacion REAL,
    estante TEXT
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
      (isbn, titulo, autor, editorial, año, portada_url, estado, descripcion, paginas, genero, idioma, saga, resena, puntuacion, estante)
      VALUES (?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)`);

    libros.forEach(libro => {
      stmt.run(
        libro.isbn,
        libro.titulo,
        libro.autor,
        libro.editorial,
        libro.año,
        libro.portada_url,
        libro.estado,
        libro.descripcion ,
        libro.paginas,
        libro.genero ,
        libro.idioma ,
        libro.saga,
        libro.resena,
        libro.puntuacion,
        libro.estante
      );
      
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
