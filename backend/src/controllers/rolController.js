const { prisma } = require('../lib/prisma');

/**
 * Obtener todos los roles
 * 
 * @route GET /api/roles
 * @access Public
 * 
 * @returns {Object} 200 - { roles: Array }
 */
const obtenerRoles = async (req, res) => {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    res.json({ roles });
  } catch (error) {
    console.error('Error en obtenerRoles:', error);
    res.status(500).json({ 
      error: 'Error al obtener roles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  obtenerRoles,
};
