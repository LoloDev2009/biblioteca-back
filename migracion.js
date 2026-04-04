import sqlite3 from "sqlite3";
import { open } from "sqlite";
import pkg from "pg";

const { Pool } = pkg;

const databasee = "postgresql://administrados:FAGJSaErBml13CfRybHlvDwIhDrsGozU@dpg-d78inns50q8c73eur820-a.oregon-postgres.render.com/biblioteca_pu3i"
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