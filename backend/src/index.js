// index.js
/*const express = require("express");
const app = express();
const PORT = 3000;

// Middleware para leer JSON
app.use(express.json());

// Ruta de prueba
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hola desde la API 👋" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' })); // tu Vite front
app.use(express.json());

// Rutas
const pages = require('./routes/pages');
const users = require('./routes/users');
const auth = require('./routes/auth');
const tipoHabitacionRoutes = require('./routes/tipoHabitacionRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const ocupacionRoutes = require('./routes/ocupacionRoutes');

app.use('/pages', pages);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/tipos-habitacion', tipoHabitacionRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ocupaciones', ocupacionRoutes);

// Ruta que ya tenías
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hola desde la API 👋' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
