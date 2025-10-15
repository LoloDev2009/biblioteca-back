const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));


// Base de datos
const db = new sqlite3.Database("biblioteca.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS libros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn TEXT UNIQUE,
    titulo TEXT,
    autor TEXT,
    editorial TEXT,
    año TEXT,
    portada_url TEXT
  )`);
});

// Buscar libro por ISBN
app.post("/api/libro", async (req, res) => {
  const { isbn } = req.body;
  try {
    // 1️⃣ Google Books
    let r = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    let info = null;

    if (r.data.totalItems > 0) {
      const vol = r.data.items[0].volumeInfo;
      info = {
        isbn,
        titulo: vol.title,
        autor: vol.authors ? vol.authors.join(", ") : "Desconocido",
        editorial: vol.publisher || "Desconocido",
        año: vol.publishedDate || "Desconocido",
        portada_url: vol.imageLinks ? vol.imageLinks.thumbnail : ""
      };
    }

    // 2️⃣ Si Google Books no devuelve nada, fallback manual
    if (!info) {
      return res.json({ manual: true });
    }

    // Guardar en base de datos
    const stmt = db.prepare(`INSERT OR IGNORE INTO libros
      (isbn, titulo, autor, editorial, año, portada_url)
      VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(isbn, info.titulo, info.autor, info.editorial, info.año, info.portada_url);
    stmt.finalize();

    res.json(info);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error" });
  }
});

// Listar todos los libros
app.get("/api/libros", (req, res) => {
  db.all("SELECT * FROM libros ORDER BY titulo", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/libro/:isbn → devuelve el libro si existe
app.get("/api/libro/:isbn", (req, res) => {
  const { isbn } = req.params;

  db.get("SELECT * FROM libros WHERE isbn = ?", [isbn], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json({}); // vacío si no existe
    res.json(row);
  });
});


// Guardar libro manual
app.post("/api/libro/manual", (req, res) => {
  const { isbn, titulo, autor, editorial, año, portada_url } = req.body;

  const stmt = db.prepare(`INSERT OR IGNORE INTO libros
    (isbn, titulo, autor, editorial, año, portada_url)
    VALUES (?, ?, ?, ?, ?, ?)`);
  stmt.run(isbn, titulo, autor, editorial, año, portada_url, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Libro agregado manualmente", titulo });
  });
  stmt.finalize();
});


app.listen(port, () => {
  console.log(`Servidor corriendo en https://localhost:${port}`);
});
