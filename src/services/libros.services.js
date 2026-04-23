import { sql } from "../db.js";

export async function getLibroByISBN(isbn) {
  const rows = await sql`
    SELECT * FROM libros WHERE isbn = ${isbn}
  `;
  return rows;
}