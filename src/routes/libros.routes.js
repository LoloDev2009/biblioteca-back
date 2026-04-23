import express from "express";
import { postLibro, deleteLibro, getLibros, getDetalle, deleteDetalle, postDetalle, saveLibro } from "../controllers/libros.controllers.js";

const router = express.Router();

router.delete("/", deleteLibro)
router.post("/", postLibro);
router.get("/all", getLibros);
router.get("/detalle", getDetalle);
router.delete("/detalle", deleteDetalle);
router.post("/detalle", postDetalle);
router.post("/save", saveLibro);

export default router;