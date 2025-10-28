const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

/**
 * @route   POST /api/reservas/verificar
 * @desc    Verificar disponibilidad de habitación y calcular precio
 * @access  Public
 * 
 * @body    {number} tipoHabitacionId - ID del tipo de habitación
 * @body    {string} fechaLlegada - Fecha de llegada en formato ISO (YYYY-MM-DD)
 * @body    {string} fechaSalida - Fecha de salida en formato ISO (YYYY-MM-DD)
 * 
 * @example
 * POST /api/reservas/verificar
 * {
 *   "tipoHabitacionId": 1,
 *   "fechaLlegada": "2025-11-01",
 *   "fechaSalida": "2025-11-05"
 * }
 * 
 * @response 200 - Disponibilidad verificada
 * {
 *   "disponible": true,
 *   "precioFinal": 400.00,
 *   "noches": 4,
 *   "tipoHabitacion": {
 *     "id": 1,
 *     "nombre": "Estancia Mirador",
 *     "categoria": "Estándar",
 *     "ocupacion": "Doble Queen",
 *     "capacidad": 2
 *   },
 *   "tarifaPorNoche": 100.00,
 *   "fechas": {
 *     "llegada": "2025-11-01",
 *     "salida": "2025-11-05"
 *   }
 * }
 * 
 * @response 200 - No disponible
 * {
 *   "disponible": false,
 *   "mensaje": "No hay habitaciones disponibles para las fechas seleccionadas",
 *   "tipoHabitacion": { "id": 1, "nombre": "Estancia Mirador" },
 *   "fechas": { "llegada": "2025-11-01", "salida": "2025-11-05" }
 * }
 */
router.post('/verificar', reservaController.verificarDisponibilidadPrecio);

module.exports = router;
