import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import libroRoutes from "./routes/libros.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/libro", libroRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando");
});


// middleware de errores SIEMPRE al final
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});