const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const pkg = require("pg");

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));


// Base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query(`SELECT NOW()`, (err, res) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conexión a la base de datos exitosa:", res.rows[0]);
  }
});

/*
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

//Endpoints

//Search Book by ISBN
app.post("/api/libro", async (req, res) => {
  const { isbn } = req.body; //Get ISBN from request body
  //Try to find book in Database
  try {
    db.get("SELECT * FROM libros WHERE isbn = ?", [isbn], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Error al consultar la base de datos" });
      }
      if (row) {
        return res.json({ type: "edit", libro: row });
      } else {
        //If not found in DB, try Google Books API
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
  //Send book info if found and type to frontend
        if (info) {
          res.json({ type: "API", libro: info });
        } else {
          res.json({ type: "manual" });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error" });
  }
  
});

//Delete Book by ISBN from query
app.delete("/api/libro", (req, res) => {
  //Get ISBN from root query
  const { isbn } = req.query;
  //Delete book from DB
  db.run("DELETE FROM libros WHERE isbn = ?", [isbn], function(err) {
    if (err) {
      return res.status(500).json({ error: "Error al eliminar el libro" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }
    res.json({ message: "Libro eliminado correctamente" });
  });
});

//Get all Books
app.get("/api/libros", (req, res) => {
  db.all("SELECT * FROM libros ORDER BY titulo", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

//Save Book
app.post("/api/libro/save", (req, res) => {
  //Get book as JSON from request body
  const { isbn, titulo, autor, editorial, año, portada_url, estado } = req.body;
  //Insert or update book in DB
  const stmt = db.prepare(`INSERT INTO libros
    (isbn, titulo, autor, editorial, año, portada_url, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(isbn) DO UPDATE SET
    titulo = excluded.titulo,
    autor = excluded.autor,
    editorial = excluded.editorial,
    año = excluded.año,
    portada_url = excluded.portada_url,
    estado = excluded.estado`);
  stmt.run(isbn, titulo, autor, editorial, año, portada_url, estado, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Libro guardado correctamente", titulo });
  });
  stmt.finalize();
});

*/
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
