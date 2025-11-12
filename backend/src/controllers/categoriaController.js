const { prisma } = require('../lib/prisma');

/**
 * Obtener todas las categorías (id y nombre)
 * 
 * @route GET /api/categorias
 * @access Public
 * 
 * @description
 * Retorna un array de objetos con id y nombre de las categorías.
 * Útil para poblar filtros en el frontend.
 * 
 * @returns {Array<Object>} 200 - Lista de categorías
 * @example [{ id: 1, nombre: 'Estándar' }, { id: 2, nombre: 'Suite' }]
 * 
 * @returns {Object} 500 - Error del servidor
 */
const getAllCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Log para depuración
    console.log('🏷️ Lista de Categorías enviada:', categorias.length);

    return res.status(200).json(categorias);

  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    return res.status(500).json({ 
      error: 'Error al obtener categorías',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllCategorias,
};
