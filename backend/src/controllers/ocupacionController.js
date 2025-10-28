const { prisma } = require('../lib/prisma');

/**
 * Obtener todas las ocupaciones (solo nombres)
 * 
 * @route GET /api/ocupaciones
 * @access Public
 * 
 * @description
 * Retorna un array simple de strings con los nombres de las ocupaciones.
 * Útil para poblar filtros en el frontend.
 * 
 * @returns {Array<string>} 200 - Lista de nombres de ocupaciones
 * @example ['Individual', 'Doble Queen', 'Triple Queen', 'Suite Familiar']
 * 
 * @returns {Object} 500 - Error del servidor
 */
const getAllOcupaciones = async (req, res) => {
  try {
    const ocupaciones = await prisma.ocupacion.findMany({
      select: {
        nombre: true,
      },
      orderBy: {
        capacidad: 'asc', // Ordenar por capacidad (1, 2, 3, 4...)
      },
    });

    // Transformar a array simple de strings
    const nombresOcupaciones = ocupaciones.map(ocu => ocu.nombre);

    // Log para depuración
    console.log('👥 Lista de Ocupaciones enviada:', nombresOcupaciones);

    return res.status(200).json(nombresOcupaciones);

  } catch (error) {
    console.error('❌ Error al obtener ocupaciones:', error);
    return res.status(500).json({ 
      error: 'Error al obtener ocupaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllOcupaciones,
};
