import { Router } from 'express';
import { listReservas, getReservaById, updateEstadoReserva, getFilters, getEstados, getHistorialReserva } from '../controllers/reservas.controller.js';

const router = Router();

/**
 * GET /api/reservas/estados
 * Obtiene TODOS los valores del enum EstadoReserva
 */
router.get('/estados', getEstados);

/**
 * GET /api/reservas/filters
 * Obtiene tipos de habitación para filtros
 */
router.get('/filters', getFilters);

/**
 * GET /api/reservas
 * Lista reservas con filtros, búsqueda y paginación
 * Query params:
 *  - q: búsqueda general
 *  - estado: filtro por estado
 *  - tipoHabitacion: filtro por tipo de habitación
 *  - fechaDesde: fecha desde (YYYY-MM-DD)
 *  - fechaHasta: fecha hasta (YYYY-MM-DD)
 *  - page: número de página (default: 1)
 *  - pageSize: items por página (default: 10)
 *  - sortBy: campo para ordenar (default: fechaIngreso)
 *  - sortDir: dirección asc|desc (default: desc)
 */
router.get('/', listReservas);

/**
 * GET /api/reservas/:id/historial
 * Obtiene el historial de movimientos de una reserva
 */
router.get('/:id/historial', getHistorialReserva);

/**
 * GET /api/reservas/:id
 * Obtiene el detalle completo de una reserva específica (incluye factura)
 */
router.get('/:id', getReservaById);

/**
 * PATCH /api/reservas/:id/estado
 * Actualiza el estado de una reserva
 */
router.patch('/:id/estado', updateEstadoReserva);

export default router;
