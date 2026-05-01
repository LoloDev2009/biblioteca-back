import axios from "axios";
import sql from "../db/db.js";

export async function getSidebar(req, res){
  try {
    const rows = await sql`
      SELECT * FROM sidebar
    `;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el sidebar" });
  }
};
