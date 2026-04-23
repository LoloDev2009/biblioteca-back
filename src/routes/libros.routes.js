import express from "express";
import { postLibro, deleteLibro, getLibros, getDetalle, deleteDetalle, postDetalle, saveLibro } from "../controllers/libros.controllers.js";

const router = express.Router();

router.delete("/api/libro", deleteLibro)
router.post("/api/libro", postLibro);
router.get("/api/libros", getLibros);
router.get("/api/libro/detalle", getDetalle);
router.delete("/api/libro/detalle", deleteDetalle);
router.post("/api/libro/detalle", postDetalle);
router.post("/api/libro/save", saveLibro);

export default router;