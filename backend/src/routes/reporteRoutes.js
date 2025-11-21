const express = require('express');
const router = express.Router();
const { generarPDFReservas } = require('../controllers/reporteController');

/**
 * POST /api/reportes/reservas/pdf
 * Genera un PDF con el reporte de reservas filtradas
 * 
 * Body: { filtros, kpis, reservas, graficos }
 * 
 * TODO: Agregar middleware de autenticación
 * TODO: Validar que solo administradores puedan acceder
 */
router.post('/reservas/pdf', generarPDFReservas);

module.exports = router;
