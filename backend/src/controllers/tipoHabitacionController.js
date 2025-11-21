const { prisma } = require('../lib/prisma');
const { deleteMultipleImages } = require('../services/imageService');

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
        // ✅ NUEVO: Contar habitaciones vinculadas
        habitaciones: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { categoriaId: 'asc' }, // Ordenar por categoría
        { ocupacionId: 'asc' }, // Luego por ocupación
      ],
    });

    // Transformar para incluir el conteo de habitaciones y convertir Decimal a número
    const tiposConConteo = tiposHabitacion.map(tipo => ({
      ...tipo,
      tarifaBase: Number(tipo.tarifaBase), // ✅ Convertir Decimal a número
      cantidadHabitaciones: tipo.habitaciones.length,
      habitaciones: undefined, // Remover el array completo, solo dejar el conteo
    }));

    // Log para depuración en consola del backend
    console.log('📋 Datos de Tipos de Habitación enviados:', {
      total: tiposConConteo.length,
      categorias: [...new Set(tiposConConteo.map(t => t.categoria.nombre))],
      ocupaciones: [...new Set(tiposConConteo.map(t => t.ocupacion.nombre))],
      habitacionesTotales: tiposConConteo.reduce((sum, t) => sum + t.cantidadHabitaciones, 0),
    });

    return res.status(200).json(tiposConConteo);

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
            id: true,           // ✅ ID necesario para eliminar
            url: true,
            descripcion: true,  // ✅ Descripción opcional
          },
        },
        
        // Amenidades con relación anidada
        amenidades: {
          include: {
            amenidad: {
              select: {
                id: true,           // ✅ AGREGAR ID
                nombre: true,
                icono: true,
              },
            },
          },
        },
      },
    });

    // Transformar amenidades para simplificar la estructura y convertir Decimal
    // De: [{ amenidad: { nombre: '...', icono: '...' } }]
    // A: [{ nombre: '...', icono: '...' }]
    const tipoHabitacionTransformado = {
      ...tipoHabitacion,
      tarifaBase: Number(tipoHabitacion.tarifaBase), // ✅ Convertir Decimal a número
      superficie: tipoHabitacion.superficie ? Number(tipoHabitacion.superficie) : null,
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

/**
 * Obtener todos los tipos de habitación CON TODAS sus imágenes
 * Específico para página de reservas donde se necesita carrusel completo
 * 
 * @route GET /api/tipos-habitacion/reservas
 * @access Public
 */
const getAllTiposHabitacionConImagenes = async (req, res) => {
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
          // ✅ TODAS las imágenes (sin take)
          select: {
            id: true,           // ✅ ID necesario para eliminar
            url: true,
            descripcion: true,  // ✅ Descripción opcional
          },
          orderBy: {
            id: 'asc', // Mantener orden consistente
          },
        },
      },
      orderBy: [
        { categoriaId: 'asc' },
        { ocupacionId: 'asc' },
      ],
    });

    // Convertir Decimal a número
    const tiposTransformados = tiposHabitacion.map(tipo => ({
      ...tipo,
      tarifaBase: Number(tipo.tarifaBase), // ✅ Convertir Decimal a número
    }));

    console.log('🖼️ Tipos con todas las imágenes enviados:', {
      total: tiposTransformados.length,
      imagenesPorTipo: tiposTransformados.map(t => ({ 
        nombre: t.nombre, 
        imagenes: t.imagenes.length 
      })),
    });

    return res.status(200).json(tiposTransformados);

  } catch (error) {
    console.error('❌ Error al obtener tipos con imágenes:', error);
    return res.status(500).json({ 
      error: 'Error al obtener tipos de habitación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar un tipo de habitación existente
 * 
 * @route PUT /api/tipos-habitacion/:id
 * @access Private (Operador/Admin)
 */
const updateTipoHabitacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const {
      nombre,
      descripcion,
      categoriaId,
      ocupacionId,
      tarifaBase,
      superficie,
      vista,
      politicas,
      amenidadesIds,  // ✅ Array de IDs de amenidades
      imagenesNuevas, // ✅ NUEVO: Array de URLs de imágenes nuevas
      imagenesEliminar // ✅ NUEVO: Array de IDs de imágenes a eliminar
    } = req.body;

    console.log('📥 Datos recibidos para actualizar:', {
      id,
      nombre,
      categoriaId,
      ocupacionId,
      amenidadesIds: amenidadesIds?.length || 0,
      imagenesNuevas: imagenesNuevas?.length || 0,
      imagenesEliminar: imagenesEliminar?.length || 0
    });

    // Validaciones básicas
    if (!nombre || !categoriaId || !ocupacionId || !tarifaBase) {
      return res.status(400).json({ 
        error: 'Campos requeridos: nombre, categoriaId, ocupacionId, tarifaBase' 
      });
    }

    // Verificar que el tipo existe
    const tipoExistente = await prisma.tipoHabitacion.findUnique({
      where: { id },
      include: {
        amenidades: true  // Para ver las amenidades actuales
      }
    });

    if (!tipoExistente) {
      return res.status(404).json({ error: 'Tipo de habitación no encontrado' });
    }

    console.log('🔍 Amenidades actuales:', tipoExistente.amenidades.length);
    console.log('🔍 Amenidades nuevas:', amenidadesIds ? amenidadesIds.length : 'No enviadas');

    // Preparar datos de actualización
    const dataToUpdate = {
      nombre,
      descripcion,
      categoriaId: parseInt(categoriaId),
      ocupacionId: parseInt(ocupacionId),
      tarifaBase: parseFloat(tarifaBase),
      superficie: superficie ? parseFloat(superficie) : null,
      vista,
      politicas
    };

    // Si se enviaron amenidades, actualizar la relación
    if (amenidadesIds !== undefined && Array.isArray(amenidadesIds)) {
      console.log('🔄 Actualizando amenidades...');
      console.log('📋 IDs de amenidades a vincular:', amenidadesIds);
      
      dataToUpdate.amenidades = {
        deleteMany: {},  // ✅ Eliminar todas las relaciones actuales
        create: amenidadesIds.map(amenidadId => ({
          amenidadId: parseInt(amenidadId)  // ✅ Crear nuevas relaciones
        }))
      };
      
      console.log('✅ Se eliminarán todas las amenidades actuales');
      console.log('✅ Se crearán', amenidadesIds.length, 'nuevas relaciones');
    } else {
      console.log('⚠️ No se enviaron amenidades, se mantienen las actuales');
    }

    // Manejar imágenes
    const imagenesOperations = {};
    
    // Eliminar imágenes
    if (imagenesEliminar && Array.isArray(imagenesEliminar) && imagenesEliminar.length > 0) {
      console.log('🗑️ Eliminando imágenes...');
      console.log('📋 IDs de imágenes a eliminar:', imagenesEliminar);
      
      imagenesOperations.deleteMany = {
        id: { in: imagenesEliminar.map(id => parseInt(id)) }
      };
      
      console.log('✅ Se eliminarán', imagenesEliminar.length, 'imágenes');
    }
    
    // Agregar imágenes nuevas
    if (imagenesNuevas && Array.isArray(imagenesNuevas) && imagenesNuevas.length > 0) {
      console.log('📸 Agregando imágenes nuevas...');
      console.log('📋 URLs de imágenes:', imagenesNuevas);
      
      imagenesOperations.create = imagenesNuevas.map((imagen) => ({
        url: imagen.url,
        descripcion: imagen.descripcion || null
      }));
      
      console.log('✅ Se agregarán', imagenesNuevas.length, 'imágenes nuevas');
    }
    
    // Si hay operaciones de imágenes, agregarlas al update
    if (Object.keys(imagenesOperations).length > 0) {
      dataToUpdate.imagenes = imagenesOperations;
    } else {
      console.log('⚠️ No se enviaron cambios de imágenes');
    }

    // Actualizar el tipo de habitación
    console.log('🔄 Iniciando actualización en Prisma...');
    console.log('📋 Datos a actualizar:', JSON.stringify(dataToUpdate, null, 2));
    
    const tipoActualizado = await prisma.tipoHabitacion.update({
      where: { id },
      data: dataToUpdate,
      include: {
        categoria: true,
        ocupacion: true,
        amenidades: {
          include: {
            amenidad: {
              select: {
                id: true,
                nombre: true,
                icono: true
              }
            }
          }
        },
        imagenes: true
      }
    });

    console.log(`✅ Tipo de habitación ID ${id} actualizado:`, tipoActualizado.nombre);
    console.log(`✅ Amenidades finales:`, tipoActualizado.amenidades.length);
    console.log(`✅ Imágenes finales:`, tipoActualizado.imagenes.length);

    return res.status(200).json({
      message: 'Tipo de habitación actualizado exitosamente',
      data: {
        ...tipoActualizado,
        tarifaBase: Number(tipoActualizado.tarifaBase),
        superficie: tipoActualizado.superficie ? Number(tipoActualizado.superficie) : null
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar tipo de habitación:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar tipo de habitación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar un tipo de habitación
 * 
 * @route DELETE /api/tipos-habitacion/:id
 * @access Private (Admin)
 */
const deleteTipoHabitacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar que el tipo existe
    const tipoExistente = await prisma.tipoHabitacion.findUnique({
      where: { id },
      include: {
        habitaciones: true,
        amenidades: true,
        imagenes: true
      }
    });

    if (!tipoExistente) {
      return res.status(404).json({ error: 'Tipo de habitación no encontrado' });
    }

    // Verificar si tiene habitaciones vinculadas
    if (tipoExistente.habitaciones.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el tipo porque tiene habitaciones vinculadas',
        habitacionesVinculadas: tipoExistente.habitaciones.length
      });
    }

    // ========== PASO 1: ELIMINAR IMÁGENES DE SUPABASE ==========
    if (tipoExistente.imagenes.length > 0) {
      console.log(`📸 Eliminando ${tipoExistente.imagenes.length} imágenes de Supabase...`);
      const imageUrls = tipoExistente.imagenes.map(img => img.url);
      const resultado = await deleteMultipleImages(imageUrls);
      console.log(`✅ Imágenes eliminadas de Supabase: ${resultado.success} exitosas, ${resultado.failed} fallidas`);
    } else {
      console.log('ℹ️ No hay imágenes para eliminar de Supabase');
    }

    // ========== PASO 2: ELIMINAR RELACIONES DE BD ==========
    console.log('🗑️ Eliminando relaciones de amenidades...');
    await prisma.tipoHabitacionAmenidad.deleteMany({
      where: { tipoHabitacionId: id }
    });

    console.log('🗑️ Eliminando metadatos de imágenes...');
    await prisma.imagenHabitacion.deleteMany({
      where: { tipoHabitacionId: id }
    });

    // ========== PASO 3: ELIMINAR TIPO DE HABITACIÓN ==========
    console.log('🗑️ Eliminando tipo de habitación...');
    await prisma.tipoHabitacion.delete({
      where: { id }
    });

    console.log(`✅ Tipo de habitación ID ${id} eliminado completamente:`, tipoExistente.nombre);

    return res.status(200).json({ 
      message: 'Tipo de habitación eliminado exitosamente',
      nombre: tipoExistente.nombre
    });

  } catch (error) {
    console.error('❌ Error al eliminar tipo de habitación:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar tipo de habitación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear un nuevo tipo de habitación
 * POST /api/tipos-habitacion
 */
const createTipoHabitacion = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoriaId,
      ocupacionId,
      tarifaBase,
      superficie,
      vista,
      politicas,
      amenidadesIds = [],
      imagenesNuevas = []
    } = req.body;

    console.log('📥 Datos recibidos para crear tipo:', {
      nombre,
      categoriaId,
      ocupacionId,
      tarifaBase,
      amenidadesIds: amenidadesIds.length,
      imagenesNuevas: imagenesNuevas.length
    });

    // Validaciones
    if (!nombre || !descripcion || !categoriaId || !ocupacionId || !tarifaBase) {
      return res.status(400).json({
        error: 'Campos requeridos: nombre, descripcion, categoriaId, ocupacionId, tarifaBase'
      });
    }

    // Verificar que el nombre no exista
    const tipoExistente = await prisma.tipoHabitacion.findFirst({
      where: { nombre }
    });

    if (tipoExistente) {
      console.log(`❌ Ya existe un tipo con nombre: ${nombre}`);
      return res.status(409).json({
        error: `Ya existe un tipo de habitación con el nombre "${nombre}"`
      });
    }

    // Preparar datos de creación
    const dataToCreate = {
      nombre,
      descripcion,
      categoriaId: parseInt(categoriaId),
      ocupacionId: parseInt(ocupacionId),
      tarifaBase: parseFloat(tarifaBase),
      superficie: superficie ? parseFloat(superficie) : null,
      vista: vista || null,
      politicas: politicas || null
    };

    // Preparar operaciones de amenidades
    const amenidadesOperations = {};
    if (amenidadesIds && amenidadesIds.length > 0) {
      console.log('✨ Vinculando amenidades...');
      console.log('📋 IDs de amenidades:', amenidadesIds);
      
      const amenidadesIdsInt = amenidadesIds.map(id => parseInt(id));
      amenidadesOperations.create = amenidadesIdsInt.map(amenidadId => ({
        amenidadId
      }));
      
      console.log(`✅ Se vincularán ${amenidadesIdsInt.length} amenidades`);
    }

    // Preparar operaciones de imágenes
    const imagenesOperations = {};
    if (imagenesNuevas && imagenesNuevas.length > 0) {
      console.log('📸 Agregando imágenes nuevas...');
      console.log('📋 URLs de imágenes:', imagenesNuevas.map(img => img.url));
      
      imagenesOperations.create = imagenesNuevas.map(imagen => ({
        url: imagen.url,
        descripcion: imagen.descripcion || null
      }));
      
      console.log(`✅ Se agregarán ${imagenesNuevas.length} imágenes nuevas`);
    }

    // Crear tipo de habitación con relaciones
    const nuevoTipo = await prisma.tipoHabitacion.create({
      data: {
        ...dataToCreate,
        amenidades: amenidadesOperations,
        imagenes: imagenesOperations
      },
      include: {
        categoria: true,
        ocupacion: true,
        amenidades: {
          include: {
            amenidad: true
          }
        },
        imagenes: true
      }
    });

    console.log(`✅ Tipo de habitación creado con ID ${nuevoTipo.id}: ${nuevoTipo.nombre}`);
    console.log(`✅ Amenidades vinculadas: ${nuevoTipo.amenidades.length}`);
    console.log(`✅ Imágenes agregadas: ${nuevoTipo.imagenes.length}`);

    return res.status(201).json({
      message: 'Tipo de habitación creado exitosamente',
      data: nuevoTipo
    });

  } catch (error) {
    console.error('❌ Error al crear tipo de habitación:', error);
    return res.status(500).json({
      error: 'Error al crear tipo de habitación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllTiposHabitacion,
  getTipoHabitacionById,
  getAllTiposHabitacionConImagenes,
  createTipoHabitacion,  // ✅ NUEVO
  updateTipoHabitacion,
  deleteTipoHabitacion,
};
