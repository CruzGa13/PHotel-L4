const { Router } = require('express');
const { obtenerRoles } = require('../controllers/rolController');

const router = Router();

/**
 * GET /api/roles - Obtener todos los roles
 * Acceso público (necesario para el formulario de registro de operadores)
 */
router.get('/', obtenerRoles);

module.exports = router;
