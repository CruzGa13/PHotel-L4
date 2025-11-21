const { Router } = require('express');
const { getAllAmenidadesCompletas } = require('../controllers/amenidadController');

const router = Router();

/**
 * GET /completas - Obtener todas las amenidades (objetos completos)
 * 
 * Endpoint: /api/amenidades/completas
 * 
 * Retorna:
 * - Array de objetos con id, nombre, descripcion, icono
 * - Útil para formularios de tipos de habitación
 */
router.get('/completas', getAllAmenidadesCompletas);

module.exports = router;
