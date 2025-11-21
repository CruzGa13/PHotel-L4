const { Router } = require('express');
const { 
  getAllHabitaciones, 
  getHabitacionesKpis, 
  getHabitacionById,
  getHabitacionesByTipo,  // ✅ NUEVO
  createHabitacion,        // ✅ NUEVO
  updateHabitacion,        // ✅ NUEVO
  deleteHabitacion,        // ✅ NUEVO
  updateHabitacionEstado,
  bloquearHabitacion,
  getAllBloqueos
} = require('../controllers/habitacionController');

const router = Router();

/**
 * GET /kpis - Obtener KPIs de habitaciones
 * Endpoint: /api/habitaciones/kpis
 * Query params: date?, incluirBloqueosVigentes?
 * Retorna: { total, activas, inactivas, criteria }
 */
router.get('/kpis', getHabitacionesKpis);

/**
 * GET /bloqueos - Obtener todos los bloqueos de habitaciones
 * Endpoint: /api/habitaciones/bloqueos
 * Query params: fechaDesde?, fechaHasta?
 * Retorna: Array de bloqueos con habitación
 */
router.get('/bloqueos', getAllBloqueos);

/**
 * GET /tipo/:tipoHabitacionId - Obtener habitaciones por tipo
 * Endpoint: /api/habitaciones/tipo/:tipoHabitacionId
 * Retorna: Array de habitaciones del tipo especificado
 */
router.get('/tipo/:tipoHabitacionId', getHabitacionesByTipo);

/**
 * POST / - Crear nueva habitación
 * Endpoint: /api/habitaciones
 * Body: { numero, piso, tipoHabitacionId, estado? }
 * Retorna: { message, data: HabitacionDTO }
 */
router.post('/', createHabitacion);

/**
 * GET /:id - Obtener detalle de una habitación
 * Endpoint: /api/habitaciones/:id
 * Retorna: { id, numero, piso, estado, tipoHabitacion }
 */
router.get('/:id', getHabitacionById);

/**
 * PUT /:id - Actualizar habitación
 * Endpoint: /api/habitaciones/:id
 * Body: { numero?, piso?, tipoHabitacionId?, estado? }
 * Retorna: { message, data: HabitacionDTO }
 */
router.put('/:id', updateHabitacion);

/**
 * DELETE /:id - Eliminar habitación
 * Endpoint: /api/habitaciones/:id
 * Retorna: { message, numero }
 */
router.delete('/:id', deleteHabitacion);

/**
 * POST /:id/bloquear - Crear bloqueo de habitación
 * Endpoint: /api/habitaciones/:id/bloquear
 * Body: { desde, hasta, motivo?, tipo? }
 * Retorna: { idBloqueo, habitacionId, desde, hasta, motivo, tipo }
 */
router.post('/:id/bloquear', bloquearHabitacion);

/**
 * PATCH /:id/estado - Actualizar estado de una habitación
 * Endpoint: /api/habitaciones/:id/estado
 * Body: { estado: "Disponible" | "Ocupada" | "Mantenimiento" }
 * Retorna: { id, numero, estado }
 */
router.patch('/:id/estado', updateHabitacionEstado);

/**
 * GET / - Obtener todas las habitaciones
 * Endpoint: /api/habitaciones
 * Retorna: { items: HabitacionDTO[] }
 */
router.get('/', getAllHabitaciones);

module.exports = router;
