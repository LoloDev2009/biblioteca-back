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

/*await sql`
  INSERT INTO detalles (
    id,
    libro_id,
    descripcion,
    paginas,
    genero,
    idioma,
    saga,
    reseña,
    puntuacion
  ) VALUES (
    DEFAULT,
    ${libroId},
    ${descripcion},
    ${paginas},
    ${genero},
    ${idioma},
    ${saga},
    ${reseña},
    ${puntuacion}
  )
`;
*/

const libros = await sql`
    SELECT * FROM detalles
    `
console.log(libros)