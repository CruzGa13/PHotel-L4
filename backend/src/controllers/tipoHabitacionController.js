const { prisma } = require('../lib/prisma');

/**
 * Obtener todos los tipos de habitación con sus relaciones
 * 
 * @route GET /api/tipos-habitacion
 * @access Public
 * 
 * @description
 * Retorna una lista completa de tipos de habitación con:
 * - Datos básicos (id, nombre, descripción, tarifa)
 * - Categoría (id, nombre)
 * - Ocupación (id, nombre, capacidad)
 * - Primera imagen (url)
 * - Amenidades (nombre, icono)
 * 
 * @returns {Array} 200 - Lista de tipos de habitación
 * @returns {Object} 500 - Error del servidor
 */
const getAllTiposHabitacion = async (req, res) => {
  try {
    const tiposHabitacion = await prisma.tipoHabitacion.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        tarifaBase: true,
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
        ocupacion: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
          },
        },
        imagenes: {
          take: 1, // Solo la primera imagen
          select: {
            url: true,
          },
        },
        amenidades: {
          include: {
            amenidad: {
              select: {
                nombre: true,
                icono: true,
              },
            },
          },
        },
      },
      orderBy: [
        { categoriaId: 'asc' }, // Ordenar por categoría
        { ocupacionId: 'asc' }, // Luego por ocupación
      ],
    });

    // Log para depuración en consola del backend
    console.log('📋 Datos de Tipos de Habitación enviados:', {
      total: tiposHabitacion.length,
      categorias: [...new Set(tiposHabitacion.map(t => t.categoria.nombre))],
      ocupaciones: [...new Set(tiposHabitacion.map(t => t.ocupacion.nombre))],
    });

    return res.status(200).json(tiposHabitacion);

  } catch (error) {
    console.error('❌ Error al obtener tipos de habitación:', error);
    return res.status(500).json({ 
      error: 'Error al obtener tipos de habitación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener detalles completos de un tipo de habitación específico por ID
 * 
 * @route GET /api/tipos-habitacion/:id
 * @access Public
 * 
 * @description
 * Retorna todos los detalles de un tipo de habitación específico:
 * - Datos completos (id, nombre, descripción, tarifa, superficie, vista, políticas)
 * - Categoría (id, nombre)
 * - Ocupación (id, nombre, capacidad, descripcionCamas)
 * - TODAS las imágenes (url)
 * - Amenidades (nombre, icono) - transformadas a array simple
 * 
 * @param {string} req.params.id - ID del tipo de habitación
 * @returns {Object} 200 - Detalles completos del tipo de habitación
 * @returns {Object} 400 - ID inválido
 * @returns {Object} 404 - Tipo de habitación no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const getTipoHabitacionById = async (req, res) => {
  try {
    // Extraer y validar el ID de los parámetros
    const id = parseInt(req.params.id, 10);

    // Validar que el ID sea un número válido
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'ID inválido. Debe ser un número entero.' 
      });
    }

    // Consultar la base de datos con todas las relaciones necesarias
    const tipoHabitacion = await prisma.tipoHabitacion.findUniqueOrThrow({
      where: { id },
      select: {
        // Campos directos del TipoHabitacion
        id: true,
        nombre: true,
        descripcion: true,
        tarifaBase: true,
        superficie: true,
        vista: true,
        politicas: true,
        
        // Relación con Categoría
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
        
        // Relación con Ocupación (incluye descripcionCamas)
        ocupacion: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            descripcionCamas: true,
          },
        },
        
        // TODAS las imágenes (no solo la primera)
        imagenes: {
          select: {
            url: true,
          },
        },
        
        // Amenidades con relación anidada
        amenidades: {
          include: {
            amenidad: {
              select: {
                nombre: true,
                icono: true,
              },
            },
          },
        },
      },
    });

    // Transformar amenidades para simplificar la estructura
    // De: [{ amenidad: { nombre: '...', icono: '...' } }]
    // A: [{ nombre: '...', icono: '...' }]
    const tipoHabitacionTransformado = {
      ...tipoHabitacion,
      amenidades: tipoHabitacion.amenidades.map(item => item.amenidad),
    };

    // Log para depuración
    console.log(`🏨 Detalles de TipoHabitación ID ${id} enviados:`, {
      nombre: tipoHabitacionTransformado.nombre,
      categoria: tipoHabitacionTransformado.categoria.nombre,
      ocupacion: tipoHabitacionTransformado.ocupacion.nombre,
      imagenes: tipoHabitacionTransformado.imagenes.length,
      amenidades: tipoHabitacionTransformado.amenidades.length,
    });

    return res.status(200).json(tipoHabitacionTransformado);

  } catch (error) {
    // Error específico: Tipo de habitación no encontrado
    if (error.code === 'P2025' || error.name === 'NotFoundError') {
      console.error(`⚠️ Tipo de habitación con ID ${req.params.id} no encontrado`);
      return res.status(404).json({ 
        error: 'Tipo de habitación no encontrado' 
      });
    }

    // Error general del servidor
    console.error('❌ Error al obtener detalles de la habitación:', error);
    return res.status(500).json({ 
      error: 'Error al obtener detalles de la habitación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllTiposHabitacion,
  getTipoHabitacionById, // ← NUEVA FUNCIÓN EXPORTADA
};
