import sqlite3 from "sqlite3";
import { open } from "sqlite";
import pkg from "pg";

const { Pool } = pkg;

const databasee = "postgresql://postgres:7wFCJxpmuL@hFu$@db.hjjbminlkjxolgzlibrb.supabase.co:5432/postgres"
// 🔌 PostgreSQL (Render)
const pool = new Pool({
  connectionString: databasee,
  ssl: { rejectUnauthorized: false }
});

async function migrar() {
  // 📂 Abrir SQLite
  const db = await open({
    filename: "./biblioteca.db", // tu archivo
    driver: sqlite3.Database
  });

  console.log("📂 SQLite conectado");

  // 📥 Leer datos
  const libros = await db.all("SELECT * FROM libros");

  console.log(`📚 ${libros.length} libros encontrados`);

  // 📤 Insertar en PostgreSQL
  for (const libro of libros) {
    await pool.query(`
      INSERT INTO libros (isbn, titulo, autor, editorial, portada_url, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (isbn) DO NOTHING
    `, [
      libro.isbn,
      libro.titulo,
      libro.autor,
      libro.editorial,
      libro.portada_url,
      libro.estado
    ]);

    console.log(`✔ Migrado: ${libro.titulo}`);
  }

  console.log("🚀 Migración completa");
  process.exit();
}

migrar();