const { Router } = require('express');
const { 
  getAllTiposHabitacion, 
  getTipoHabitacionById,
  getAllTiposHabitacionConImagenes,
  createTipoHabitacion,  // ✅ NUEVO
  updateTipoHabitacion,
  deleteTipoHabitacion
} = require('../controllers/tipoHabitacionController');

const router = Router();

/**
 * GET /reservas - Obtener todos los tipos CON TODAS sus imágenes
 * 
 * Endpoint: /api/tipos-habitacion/reservas
 * 
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar conflictos
 * 
 * Retorna:
 * - Lista completa de tipos de habitación
 * - Con categoría, ocupación y TODAS las imágenes (no solo la primera)
 * - Específico para página de reservas con carrusel
 */
router.get('/reservas', getAllTiposHabitacionConImagenes); // ← NUEVA RUTA

/**
 * GET /:id - Obtener detalles completos de un tipo de habitación específico
 * 
 * Endpoint: /api/tipos-habitacion/:id
 * 
 * IMPORTANTE: Esta ruta debe estar DESPUÉS de rutas específicas como /reservas
 * 
 * Retorna:
 * - Detalles completos del tipo de habitación
 * - Categoría y ocupación
 * - TODAS las imágenes
 * - Amenidades transformadas a array simple
 * - Superficie, vista, políticas
 */
router.get('/:id', getTipoHabitacionById);

/**
 * POST / - Crear un nuevo tipo de habitación
 * 
 * Endpoint: /api/tipos-habitacion
 * Access: Private (Operador/Admin)
 * 
 * Body:
 * - nombre (required)
 * - descripcion (required)
 * - categoriaId (required)
 * - ocupacionId (required)
 * - tarifaBase (required)
 * - superficie (optional)
 * - vista (optional)
 * - politicas (optional)
 * - amenidadesIds (optional array)
 * - imagenesNuevas (optional array)
 */
router.post('/', createTipoHabitacion);

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

/**
 * PUT /:id - Actualizar un tipo de habitación
 * 
 * Endpoint: /api/tipos-habitacion/:id
 * Access: Private (Operador/Admin)
 * 
 * Body:
 * - nombre (required)
 * - descripcion
 * - categoriaId (required)
 * - ocupacionId (required)
 * - tarifaBase (required)
 * - superficie
 * - vista
 * - politicas
 */
router.put('/:id', updateTipoHabitacion);

/**
 * DELETE /:id - Eliminar un tipo de habitación
 * 
 * Endpoint: /api/tipos-habitacion/:id
 * Access: Private (Admin)
 * 
 * Validaciones:
 * - No se puede eliminar si tiene habitaciones vinculadas
 * - Elimina automáticamente amenidades e imágenes relacionadas
 */
router.delete('/:id', deleteTipoHabitacion);

module.exports = router;
