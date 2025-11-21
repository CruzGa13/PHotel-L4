const { Router } = require('express');
const {
  crearOperador,
  obtenerOperadores,
  obtenerOperadorPorId,
  actualizarOperador,
  eliminarOperador,
  cambiarEstadoOperador,
} = require('../controllers/operadorController');
const { verifyAuth } = require('../middlewares/auth');

const router = Router();

// Middleware para verificar que el usuario sea administrador
const verificarAdmin = async (req, res, next) => {
  try {
    // El middleware verifyAuth ya puso el usuario en req.user
    const { prisma } = require('../lib/prisma');
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: { rol: true },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que sea administrador (rolId: 3)
    if (usuario.rolId !== 3) {
      return res.status(403).json({ 
        error: 'Acceso denegado. Solo administradores pueden gestionar operadores' 
      });
    }

    next();
  } catch (error) {
    console.error('Error en verificarAdmin:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

/**
 * POST /api/operadores - Crear nuevo operador
 * Requiere: Authorization Bearer token + rol administrador
 */
router.post('/', verifyAuth, verificarAdmin, crearOperador);

/**
 * GET /api/operadores - Obtener todos los operadores
 * Requiere: Authorization Bearer token + rol administrador
 */
router.get('/', verifyAuth, verificarAdmin, obtenerOperadores);

/**
 * GET /api/operadores/:id - Obtener operador por ID
 * Requiere: Authorization Bearer token + rol administrador
 */
router.get('/:id', verifyAuth, verificarAdmin, obtenerOperadorPorId);

/**
 * PUT /api/operadores/:id - Actualizar operador
 * Requiere: Authorization Bearer token + rol administrador
 */
router.put('/:id', verifyAuth, verificarAdmin, actualizarOperador);

/**
 * DELETE /api/operadores/:id - Eliminar operador (soft delete)
 * Requiere: Authorization Bearer token + rol administrador
 */
router.delete('/:id', verifyAuth, verificarAdmin, eliminarOperador);

/**
 * PATCH /api/operadores/:id/estado - Cambiar estado del operador
 * Requiere: Authorization Bearer token + rol administrador
 */
router.patch('/:id/estado', verifyAuth, verificarAdmin, cambiarEstadoOperador);

module.exports = router;
