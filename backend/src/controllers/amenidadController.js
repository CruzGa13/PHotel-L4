const { prisma } = require('../lib/prisma');

/**
 * Obtener todas las amenidades con información completa
 * 
 * @route GET /api/amenidades/completas
 * @access Public
 * 
 * @description
 * Retorna todas las amenidades con id, nombre, descripcion e icono.
 * Útil para formularios de tipos de habitación.
 * 
 * @returns {Array<Object>} 200 - Lista de amenidades completas
 * @example [{ id: 1, nombre: 'Wi-Fi', descripcion: 'Internet de alta velocidad', icono: 'wifi' }]
 * 
 * @returns {Object} 500 - Error del servidor
 */
const getAllAmenidadesCompletas = async (req, res) => {
  try {
    const amenidades = await prisma.amenidad.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        icono: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    console.log('✨ Amenidades completas enviadas:', amenidades.length);

    return res.status(200).json(amenidades);

  } catch (error) {
    console.error('❌ Error al obtener amenidades completas:', error);
    return res.status(500).json({ 
      error: 'Error al obtener amenidades',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllAmenidadesCompletas,
};
