import postgres from "postgres";

const databasee = 'postgresql://postgres.hjjbminlkjxolgzlibrb:laputamadrepassorddelorto@aws-1-us-east-2.pooler.supabase.com:6543/postgres'

const connectionString = databasee
const sql = postgres(connectionString)


const libroId = 12; // ID del libro al que quieres agregar detalles
const descripcion = "Decidí que Orion Lake debía morir cuando me salvó la vida por segunda vez.";
const paginas = 348;
const genero = "Comedia";
const idioma = "Español";
const saga = "Diario de Greg";
const reseña = "Muy bueno";
const puntuacion = 4;
const estante = "A1";
const titulo = "Novelas Inolvidables: Blanca Nieves"
const isbn = "97884471734641";
/*
await sql`
  DROP TABLE IF EXISTS detalles;
`;

await sql`
  CREATE TABLE sidebar (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  code TEXT NOT NULL
);
`;
*/
await sql`
  INSERT INTO sidebar (nombre, code) VALUES
  ('Libros', 'libros'),
  ('Estadisticas', 'estadisticas'),
  ('Data', 'data'),
  ('Personalizar', 'personalizar');
`;
// await sql`DELETE FROM detalles WHERE libro_id = ${libroId};`
/* await sql`
  INSERT INTO detalles (
    libro_id,
    descripcion,
    paginas,
    genero,
    idioma,
    saga,
    resena,
    puntuacion,
    estante
  ) VALUES (
    ${libroId},
    ${descripcion},
    ${paginas},
    ${genero},
    ${idioma},
    ${saga},
    ${reseña},
    ${puntuacion},
    ${estante}
  )
`;

*/
/*const libros = await sql`
  INSERT INTO detalles (
    libro_id,
    genero,
    idioma,
    saga,
    resena,
    puntuacion,
    estante
  )
  SELECT
    libros.id,
    ${genero},
    ${idioma},
    ${saga},
    ${reseña},
    ${puntuacion},
    ${estante}
  FROM libros
  WHERE libros.titulo LIKE 'Diario de Greg%'
  ON CONFLICT (libro_id) DO UPDATE SET
    genero = EXCLUDED.genero,
    idioma = EXCLUDED.idioma,
    saga = EXCLUDED.saga,
    resena = EXCLUDED.resena,
    puntuacion = EXCLUDED.puntuacion,
    estante = EXCLUDED.estante;
`;
*/
const libros = await sql`
      UPDATE libros SET isbn = ${isbn} WHERE titulo = ${titulo}
    `;

console.log(libros)