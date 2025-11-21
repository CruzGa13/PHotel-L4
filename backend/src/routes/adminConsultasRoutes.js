const express = require('express');
const router = express.Router();
const { obtenerResumen, obtenerReservas } = require('../controllers/adminConsultasController');

/**
 * GET /api/admin/consultas/resumen
 * Obtiene KPIs y datos para gráficos
 * 
 * TODO: Agregar middleware de autenticación
 * TODO: Validar que solo administradores puedan acceder
 */
router.get('/resumen', obtenerResumen);

/**
 * GET /api/admin/consultas/reservas
 * Obtiene lista paginada de reservas filtradas
 * 
 * TODO: Agregar middleware de autenticación
 * TODO: Validar que solo administradores puedan acceder
 */
router.get('/reservas', obtenerReservas);

module.exports = router;
