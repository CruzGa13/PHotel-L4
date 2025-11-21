const { prisma } = require('../lib/prisma');

/**
 * Obtener todas las ocupaciones (solo nombres) - Para página de reservas
 * 
 * @route GET /api/ocupaciones
 * @access Public
 * 
 * @description
 * Retorna un array simple de strings con los nombres de las ocupaciones.
 * Útil para poblar filtros en el frontend de reservas.
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
    console.log('👥 Lista de Ocupaciones (nombres) enviada:', nombresOcupaciones);

    return res.status(200).json(nombresOcupaciones);

  } catch (error) {
    console.error('❌ Error al obtener ocupaciones:', error);
    return res.status(500).json({ 
      error: 'Error al obtener ocupaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener todas las ocupaciones (objetos completos) - Para formularios
 * 
 * @route GET /api/ocupaciones/completas
 * @access Public
 * 
 * @description
 * Retorna un array de objetos con id, nombre, capacidad y descripcionCamas.
 * Útil para formularios de tipos de habitación.
 * 
 * @returns {Array<Object>} 200 - Lista de ocupaciones completas
 * @example [{ id: 1, nombre: 'Individual', capacidad: 1, descripcionCamas: '1 cama individual' }]
 * 
 * @returns {Object} 500 - Error del servidor
 */
const getAllOcupacionesCompletas = async (req, res) => {
  try {
    const ocupaciones = await prisma.ocupacion.findMany({
      select: {
        id: true,
        nombre: true,
        capacidad: true,
        descripcionCamas: true,
      },
      orderBy: {
        capacidad: 'asc',
      },
    });

    // Log para depuración
    console.log('👥 Lista de Ocupaciones (completas) enviada:', ocupaciones.length);

    return res.status(200).json(ocupaciones);

  } catch (error) {
    console.error('❌ Error al obtener ocupaciones completas:', error);
    return res.status(500).json({ 
      error: 'Error al obtener ocupaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllOcupaciones,
  getAllOcupacionesCompletas, // ← NUEVO
};
