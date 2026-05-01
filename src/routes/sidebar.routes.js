import express from "express";
import { getSidebar } from "../controllers/sidebar.controllers.js";

const router = express.Router();

router.get("/",getSidebar);

export default router;