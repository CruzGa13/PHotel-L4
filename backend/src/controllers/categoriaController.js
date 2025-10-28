const { prisma } = require('../lib/prisma');

/**
 * Obtener todas las categorías (solo nombres)
 * 
 * @route GET /api/categorias
 * @access Public
 * 
 * @description
 * Retorna un array simple de strings con los nombres de las categorías.
 * Útil para poblar filtros en el frontend.
 * 
 * @returns {Array<string>} 200 - Lista de nombres de categorías
 * @example ['Estándar', 'Deluxe', 'Ejecutiva', 'Suite']
 * 
 * @returns {Object} 500 - Error del servidor
 */
const getAllCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      select: {
        nombre: true,
      },
      orderBy: {
        id: 'asc', // Mantener orden consistente
      },
    });

    // Transformar a array simple de strings
    const nombresCategorias = categorias.map(cat => cat.nombre);

    // Log para depuración
    console.log('🏷️ Lista de Categorías enviada:', nombresCategorias);

    return res.status(200).json(nombresCategorias);

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
