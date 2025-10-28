const { Router } = require('express');
const { 
  getAllTiposHabitacion, 
  getTipoHabitacionById // ← NUEVA FUNCIÓN IMPORTADA
} = require('../controllers/tipoHabitacionController');

const router = Router();

/**
 * GET /:id - Obtener detalles completos de un tipo de habitación específico
 * 
 * Endpoint: /api/tipos-habitacion/:id
 * 
 * IMPORTANTE: Esta ruta debe estar ANTES de GET / para evitar conflictos
 * (Express evalúa rutas en orden y /:id podría capturar cualquier cosa)
 * 
 * Retorna:
 * - Detalles completos del tipo de habitación
 * - Categoría y ocupación
 * - TODAS las imágenes
 * - Amenidades transformadas a array simple
 * - Superficie, vista, políticas
 */
router.get('/:id', getTipoHabitacionById); // ← NUEVA RUTA AGREGADA

/**
 * GET / - Obtener todos los tipos de habitación
 * 
 * Endpoint: /api/tipos-habitacion
 * 
 * Retorna:
 * - Lista completa de tipos de habitación
 * - Con categoría, ocupación, primera imagen y amenidades
 * - Ordenados por categoría y ocupación
 */
router.get('/', getAllTiposHabitacion);

module.exports = router;
