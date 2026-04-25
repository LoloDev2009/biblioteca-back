import axios from "axios";
import sql from "../db/db.js";

export async function postLibro(req, res, next){
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
      r = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
      );
    } catch (err) {
      throw new AppError(
        "Error al consultar Google Books API",
        502,
        "EXTERNAL_API_ERROR",
      );
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
        portada_url: vol.imageLinks ? vol.imageLinks.thumbnail : "",
      };
    }

    if (info) {
      return res.json({ type: "API", libro: info });
    }

    return res.json({ type: "manual" });
  } catch (err) {
    next(err);
  }
};

export async function deleteLibro(req, res, next){
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
};

export async function getLibros(req, res){
  console.log("Entró al endpoint: /api/libro/all");
  try {
    const rows = await sql`
      SELECT * FROM libros ORDER BY titulo
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export async function getDetalle(req, res){
  const { isbn } = req.query;
  console.log("Entró al endpoint: /api/libro/detalles");
  try {
    const rows = await sql`
      SELECT * FROM libros
      LEFT JOIN detalles ON detalles.libro_id = libros.id
      WHERE libros.isbn = ${isbn}
    `;
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export async function deleteDetalle(req, res){
  const { isbn } = req.query;
  console.log("Entró al endpoint: /api/libro/detalles");
  try {
    const result = await sql`
      DELETE FROM detalles USING libros WHERE detalles.libro_id = libros.id AND libros.isbn = ${isbn}
    `;

    if (result.count === 0) {
      return res.status(404).json({ error: "Detalles no encontrados" });
    }
    res.json({ message: "Detalles eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export async function postDetalle(req, res){
  const {
    libro_id,
    descripcion,
    paginas,
    genero,
    idioma,
    saga,
    resena,
    puntuacion,
    estante
  } = req.body;
  
  try {
    await sql`
      INSERT INTO detalles (libro_id, descripcion, paginas, genero, idioma, saga, resena, puntuacion, estante)
      VALUES (${libro_id}, ${descripcion || null}, ${paginas || null}, ${genero || null}, ${idioma || null}, ${saga || null}, ${resena || null}, ${puntuacion || null}, ${estante || null})
      ON CONFLICT (libro_id) DO UPDATE SET
        descripcion = EXCLUDED.descripcion,
        paginas = EXCLUDED.paginas,
        genero = EXCLUDED.genero,
        idioma = EXCLUDED.idioma,
        saga = EXCLUDED.saga,
        resena = EXCLUDED.resena,
        puntuacion = EXCLUDED.puntuacion,
        estante = EXCLUDED.estante
    `;

    res.json({ message: "Libro guardado", libro_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export async function saveLibro(req, res){
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
};