import postgres from "postgres";

const databasee = 'postgresql://postgres.hjjbminlkjxolgzlibrb:laputamadrepassorddelorto@aws-1-us-east-2.pooler.supabase.com:6543/postgres'

const connectionString = databasee
const sql = postgres(connectionString)


const libroId = 12; // ID del libro al que quieres agregar detalles
const descripcion = "Decidí que Orion Lake debía morir cuando me salvó la vida por segunda vez.";
const paginas = 348;
const genero = "Fantasía";
const idioma = "Español";
const saga = "Escolomancia";
const reseña = "Muy bueno :)";
const puntuacion = 4.5;
const estante = "A3";
const isbn = "9789874777744";
/*
await sql`
  DROP TABLE IF EXISTS detalles;
`;

await sql`
  CREATE TABLE detalles (
  libro_id INTEGER PRIMARY KEY REFERENCES libros(id),
  descripcion TEXT,
  paginas INTEGER,
  genero TEXT,
  idioma TEXT,
  saga TEXT,
  resena TEXT,
  puntuacion FLOAT,
  estante TEXT
);
`;

*/

await sql`DELETE FROM detalles WHERE libro_id = ${libroId};`
await sql`
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


const libros = await sql`
    SELECT * FROM detalles
    `

/*
const libros = await sql`
      SELECT * FROM detalles JOIN libros ON detalles.libro_id = libros.id WHERE libros.isbn = ${isbn}
    `;
*/
console.log(libros)