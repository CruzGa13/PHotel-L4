const { Router } = require('express');
const { registroAtomico } = require('../controllers/authController');

const router = Router();

/**
 * POST /api/auth/register - Registro atómico de usuario
 * 
 * Este endpoint implementa un registro "transaccional":
 * 1. Valida datos del perfil
 * 2. Crea usuario en Supabase Auth
 * 3. Crea perfil en BD de Neon
 * 
 * Si algún paso falla, se hace rollback completo.
 * 
 * Body esperado:
 * {
 *   "email": "usuario@ejemplo.com",
 *   "password": "MiPassword123",
 *   "nombre": "Juan",
 *   "apellido": "Pérez",
 *   "fechaNacimiento": "1990-05-15T00:00:00.000Z",
 *   "genero": "Masculino"
 * }
 */
router.post('/register', registroAtomico);

module.exports = router;
