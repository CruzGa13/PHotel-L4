const { Router } = require('express');
const { 
  getAllOcupaciones, 
  getAllOcupacionesCompletas 
} = require('../controllers/ocupacionController');

const router = Router();

/**
 * GET /completas - Obtener todas las ocupaciones (objetos completos)
 * 
 * Endpoint: /api/ocupaciones/completas
 * 
 * IMPORTANTE: Esta ruta debe estar ANTES de / para evitar conflictos
 * 
 * Retorna:
 * - Array de objetos con id, nombre, capacidad, descripcionCamas
 * - Útil para formularios de tipos de habitación
 */
router.get('/completas', getAllOcupacionesCompletas);

/**
 * GET / - Obtener todas las ocupaciones (solo nombres)
 * 
 * Endpoint: /api/ocupaciones
 * 
 * Retorna:
 * - Array simple de strings con nombres de ocupaciones
 * - Ordenados por capacidad (menor a mayor)
 * - Ejemplo: ['Individual', 'Doble Queen', 'Triple Twin', 'Suite Familiar']
 * - Usado por página de reservas
 */
router.get('/', getAllOcupaciones);

module.exports = router;
