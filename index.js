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

// Error handling class
class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}


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

await sql`
  CREATE TABLE IF NOT EXISTS detalles (
    id SERIAL PRIMARY KEY,
    libro_id INTEGER UNIQUE REFERENCES libros(id) ON DELETE CASCADE,

    descripcion TEXT,
    paginas INTEGER,
    genero TEXT,
    idioma TEXT,
    saga TEXT,
    reseña TEXT,
    puntuacion FLOAT
  );
`;

//Endpoints

app.post("/api/libro", async (req, res, next) => {
  try {
    const { isbn } = req.body;

    if (!isbn) {
      throw new AppError("ISBN requerido", 400, "VALIDATION_ERROR");
    }

    const rows = await sql`
      SELECT * FROM libros WHERE isbn = ${isbn}
    `;

    if (rows.length > 0) {
      return res.json({ type: "edit", libro: rows[0] });
    }

    // Google Books
    let r;
    try {
      r = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    } catch (err) {
      throw new AppError("Error al consultar Google Books API", 502, "EXTERNAL_API_ERROR");
    }

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

    if (info) {
      return res.json({ type: "API", libro: info });
    }

    return res.json({ type: "manual" });

  } catch (err) {
    next(err);
  }
});
//Delete Book by ISBN from query
app.delete("/api/libro", async (req, res, next) => {
  try {
    const { isbn } = req.query;
    if (!isbn) {
      throw new AppError("ISBN requerido", 400, "VALIDATION_ERROR");
    }
    const result = await sql`
      DELETE FROM libros WHERE isbn = ${isbn}
    `;

    if (result.count === 0) {
      throw new AppError("Libro no encontrado", 404, "BOOK_NOT_FOUND");
    }
    res.json({ message: "Libro eliminado" });
  } catch (err) {
    next(err);
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

//Get book details by ISBN
app.get("/api/libro/detalle", async (req, res) => {
  const { isbn } = req.query;
  console.log("Entró al endpoint: /api/libro/detalles");
  try {
    const rows = await sql`
      SELECT * FROM detalles JOIN libros ON detalles.libro_id = libros.id WHERE libros.isbn = ${isbn}
    `;
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Post book details by ISBN
app.post("/api/libro/detalle", async (req, res) => {
  const { libro_id, descripcion, paginas, genero, idioma, saga, reseña, puntuacion, estante} = req.body;

  try {
    await sql`
      INSERT INTO detalles (libro_id, descripcion, paginas, genero, idioma, saga, reseña, puntuacion, estante)
      VALUES (${libro_id}, ${descripcion || null}, ${paginas || null}, ${genero || null}, ${idioma || null}, ${saga || null}, ${reseña || null}, ${puntuacion || null}, ${estante || null})
      ON CONFLICT (libro_id) DO UPDATE SET
        descripcion = EXCLUDED.descripcion,
        paginas = EXCLUDED.paginas,
        genero = EXCLUDED.genero,
        idioma = EXCLUDED.idioma,
        saga = EXCLUDED.saga,
        resena = EXCLUDED.reseña,
        puntuacion = EXCLUDED.puntuacion,
        estante = EXCLUDED.estante
    `;

    res.json({ message: "Libro guardado", libro_id });

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
