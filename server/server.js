// server.js con MongoDB local
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express(); // nicializamos la app

// ▶ Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../public")));

// ▶ Middleware para JSON y CORS
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB local");

    // Esto no es obligatorio, pero ayuda a forzar que aparezca en Compass
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error("Error al listar colecciones:", err);
      } else {
        console.log("📚 Colecciones actuales:", collections);
      }
    });
  })
  .catch((err) => console.error("Error al conectar con MongoDB:", err));

// modelo de Mongoose
const resultadoSchema = new mongoose.Schema({
  nombre: String,
  puntaje: Number,
  total: Number,
  fecha: String,
});

const Resultado = mongoose.model("Resultado", resultadoSchema);

// Ruta para obtener resultados
app.get("/resultados", async (req, res) => {
  try {
    const resultados = await Resultado.find();
    res.json(resultados);
  } catch (err) {
    console.error("Error al obtener resultados:", err);
    res.status(500).json({ error: "Error al obtener resultados" });
  }
});

// Ruta para guardar un nuevo resultado
app.post("/guardar", async (req, res) => {
  const { nombre, puntaje, total, fecha } = req.body;
  console.log("Datos recibidos del frontend:", req.body);

  try {
    const nuevoResultado = new Resultado({ nombre, puntaje, total, fecha });
    await nuevoResultado.save();
    console.log("Resultado guardado en MongoDB");
    res.json({ mensaje: "Puntaje guardado correctamente en MongoDB" });
  } catch (err) {
    console.error("Error al guardar en MongoDB:", err);
    res.status(500).json({ error: "Error al guardar el resultado" });
  }
});

// ▶ Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
