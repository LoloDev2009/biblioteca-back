import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import postgres from "postgres";
import axios from "axios";


const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)


try {
  const result = await sql`SELECT NOW()`;
  console.log("Conectado:", result);
} catch (err) {
  console.error("Error DB:", err);
}

await sql`
  CREATE TABLE IF NOT EXISTS libros (
    id SERIAL PRIMARY KEY,
    isbn TEXT UNIQUE,
    titulo TEXT,
    autor TEXT,
    editorial TEXT,
    año TEXT,
    portada_url TEXT,
    estado TEXT
  )
`;

console.log("Tabla 'libros' creada o verificada correctamente.");

//Endpoints

//Search Book by ISBN
app.post("/api/libro", async (req, res) => {
  const { isbn } = req.body; //Get ISBN from request body
  //Try to find book in Database
  try {
    const rows = await sql`
      SELECT * FROM libros WHERE isbn = ${isbn}
    `;

    if (rows.length > 0) {
      return res.json({ type: "edit", libro: rows[0] });
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error DB" });
  }
});

//Delete Book by ISBN from query
app.delete("/api/libro", async (req, res) => {
  const { isbn } = req.query;

  try {
    const result = await sql`
      DELETE FROM libros WHERE isbn = ${isbn}
    `;

    if (result.count === 0) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    res.json({ message: "Libro eliminado" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Get all Books
app.get("/api/libros", async (req, res) => {
  console.log("Entró al endpoint: /api/libros");
  try {
    const rows = await sql`
      SELECT * FROM libros ORDER BY titulo
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Save Book
app.post("/api/libro/save", async (req, res) => {
  const { isbn, titulo, autor, editorial, año, portada_url, estado } = req.body;

  try {
    await sql`
      INSERT INTO libros (isbn, titulo, autor, editorial, año, portada_url, estado)
      VALUES (${isbn}, ${titulo || "Desconocido"}, ${autor || "Desconocido"}, ${editorial || "Desconocido"}, ${año || "Desconocido"}, ${portada_url || null}, ${estado || null})
      ON CONFLICT (isbn) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        autor = EXCLUDED.autor,
        editorial = EXCLUDED.editorial,
        año = EXCLUDED.año,
        portada_url = EXCLUDED.portada_url,
        estado = EXCLUDED.estado
    `;

    res.json({ message: "Libro guardado", titulo });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
