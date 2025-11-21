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

// TODO: centralizar allowlist si se necesita en múltiples archivos
const ALLOWLIST = new Set([
  'http://localhost:5173',
  // Frontend en Vercel
  'https://p-hotel-l4-qc2k-2s03hh7bc-ainpedrocruz2000-1713s-projects.vercel.app',
]);

// CORS con allowlist: permite orígenes válidos + herramientas sin Origin (curl/Postman)
app.use(cors({
  origin(origin, callback) {
    // Permitir si no hay Origin (curl/Postman) o si está en la allowlist
    if (!origin || ALLOWLIST.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido'));
  },
  credentials: true,
}));

// ⚠️ IMPORTANTE: Montar webhook de Stripe ANTES de express.json()
// El webhook necesita el body crudo para verificar la firma
const pagosRoutes = require('./routes/pagosRoutes');
app.use('/api/pagos', pagosRoutes);

// Middleware JSON para el resto de la app (aumentar límite para PDFs con gráficos base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas
const pages = require('./routes/pages');
const users = require('./routes/users');
const auth = require('./routes/auth');
const tipoHabitacionRoutes = require('./routes/tipoHabitacionRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const ocupacionRoutes = require('./routes/ocupacionRoutes');
const amenidadRoutes = require('./routes/amenidadRoutes');
const facturasRoutes = require('./routes/facturasRoutes');
const habitacionRoutes = require('./routes/habitacionRoutes');
const emailController = require('./controllers/emailController');
const operadorRoutes = require('./routes/operadorRoutes');
const rolRoutes = require('./routes/rolRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const adminConsultasRoutes = require('./routes/adminConsultasRoutes');

app.use('/pages', pages);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/tipos-habitacion', tipoHabitacionRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ocupaciones', ocupacionRoutes);
app.use('/api/amenidades', amenidadRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/emails', emailController);
app.use('/api/operadores', operadorRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/admin/consultas', adminConsultasRoutes);

// Ruta que ya tenías
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hola desde la API 👋' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Montar reservasFlow.js (ESM) desde index.js (CommonJS)
(async () => {
  try {
    const reservasFlowRouter = (await import('./routes/reservasFlow.js')).default;
    app.use('/api', reservasFlowRouter); // expone /api/disponibilidad, /api/pre-reservas, /api/reservas
    console.log('reservasFlow montado en /api');
  } catch (e) {
    console.error('No se pudo montar reservasFlow:', e);
  }
})();

// Montar reservas.routes.js (ESM) - Gestión de operador
(async () => {
  try {
    const reservasRouter = (await import('./routes/reservas.routes.js')).default;
    app.use('/api/reservas', reservasRouter); // expone /api/reservas (GET, PATCH)
    console.log('reservas.routes montado en /api/reservas');
  } catch (e) {
    console.error('No se pudo montar reservas.routes:', e);
  }
})();

