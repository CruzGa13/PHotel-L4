const { Router } = require('express');
const { getAllOcupaciones } = require('../controllers/ocupacionController');

const router = Router();

/**
 * GET / - Obtener todas las ocupaciones (solo nombres)
 * 
 * Endpoint: /api/ocupaciones
 * 
 * Retorna:
 * - Array simple de strings con nombres de ocupaciones
 * - Ordenados por capacidad (menor a mayor)
 * - Ejemplo: ['Individual', 'Doble Queen', 'Triple Twin', 'Suite Familiar']
 */
router.get('/', getAllOcupaciones);

module.exports = router;
