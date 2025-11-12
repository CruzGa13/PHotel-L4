const { prisma } = require('../lib/prisma');

/**
 * Obtener todas las habitaciones con paginación y ordenamiento
 * GET /api/habitaciones?page=1&pageSize=10&orderBy=numero&dir=asc
 */
const getAllHabitaciones = async (req, res) => {
  try {
    // Extraer parámetros de paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
    const skip = (page - 1) * pageSize;

    // Extraer parámetros de ordenamiento
    const orderBy = req.query.orderBy || 'numero';
    const dir = req.query.dir === 'desc' ? 'desc' : 'asc';

    // Extraer parámetros de filtros
    const { q, categoriaId, tipoHabitacionId, capacidad } = req.query;

    // Construir cláusula WHERE dinámicamente
    const where = {};

    // Filtro de búsqueda por texto (numero o tipo)
    if (q) {
      where.OR = [
        { numero: { contains: q, mode: 'insensitive' } },
        { tipoHabitacion: { nombre: { contains: q, mode: 'insensitive' } } }
      ];
    }

    // Filtro por categoría
    if (categoriaId) {
      where.tipoHabitacion = {
        ...where.tipoHabitacion,
        categoriaId: parseInt(categoriaId)
      };
    }

    // Filtro por tipo de habitación
    if (tipoHabitacionId) {
      where.tipoHabitacionId = parseInt(tipoHabitacionId);
    }

    // Filtro por capacidad (>=)
    if (capacidad) {
      where.tipoHabitacion = {
        ...where.tipoHabitacion,
        ocupacion: {
          capacidad: { gte: parseInt(capacidad) }
        }
      };
    }

    // Construir cláusula orderBy según el campo
    let orderByClause = {};
    switch (orderBy) {
      case 'numero':
        orderByClause = { numero: dir };
        break;
      case 'piso':
        orderByClause = { piso: dir };
        break;
      case 'tipo':
        orderByClause = { tipoHabitacion: { nombre: dir } };
        break;
      case 'categoria':
        orderByClause = { tipoHabitacion: { categoria: { nombre: dir } } };
        break;
      case 'ocupacion':
        orderByClause = { tipoHabitacion: { ocupacion: { nombre: dir } } };
        break;
      case 'capacidad':
        orderByClause = { tipoHabitacion: { ocupacion: { capacidad: dir } } };
        break;
      default:
        orderByClause = { numero: dir };
    }

    // Consultar total y datos en paralelo
    const [total, habitaciones] = await Promise.all([
      prisma.habitacion.count({ where }),
      prisma.habitacion.findMany({
        where,
        select: {
          id: true,
          numero: true,
          piso: true,
          estado: true,
          tipoHabitacion: {
            select: {
              id: true,
              nombre: true,
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
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    console.log(`📋 Habitaciones: página ${page}/${totalPages}, mostrando ${habitaciones.length} de ${total}`);

    return res.status(200).json({ 
      items: habitaciones,
      page,
      pageSize,
      total,
      totalPages,
    });

  } catch (error) {
    console.error('❌ Error al obtener habitaciones:', error);
    return res.status(500).json({
      error: 'Error al obtener habitaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Obtener KPIs de habitaciones
 * GET /api/habitaciones/kpis?date=2025-11-08&incluirBloqueosVigentes=true
 */
const getHabitacionesKpis = async (req, res) => {
  try {
    // Extraer parámetros
    const { date, incluirBloqueosVigentes } = req.query;
    const incluirBloqueos = incluirBloqueosVigentes === 'true';
    
    // Determinar fecha (default: hoy)
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Total de habitaciones
    const total = await prisma.habitacion.count();

    let activas = 0;
    let inactivas = 0;

    if (incluirBloqueos) {
      // Con bloqueos vigentes
      // Habitaciones con bloqueo vigente en la fecha
      const habitacionesConBloqueo = await prisma.habitacionBloqueo.findMany({
        where: {
          desde: { lte: endOfDay },
          hasta: { gte: startOfDay },
        },
        select: {
          habitacionId: true,
        },
        distinct: ['habitacionId'],
      });
      
      const idsConBloqueo = new Set(habitacionesConBloqueo.map(b => b.habitacionId));

      // Habitaciones en mantenimiento
      const enMantenimiento = await prisma.habitacion.count({
        where: { estado: 'Mantenimiento' },
      });

      // Habitaciones Disponible u Ocupada SIN bloqueo
      const disponiblesUOcupadas = await prisma.habitacion.findMany({
        where: {
          estado: { in: ['Disponible', 'Ocupada'] },
        },
        select: { id: true },
      });

      const activasSinBloqueo = disponiblesUOcupadas.filter(
        h => !idsConBloqueo.has(h.id)
      ).length;

      activas = activasSinBloqueo;
      inactivas = total - activas; // Mantenimiento + bloqueadas

    } else {
      // Sin considerar bloqueos
      // Activas: Disponible + Ocupada
      activas = await prisma.habitacion.count({
        where: {
          estado: { in: ['Disponible', 'Ocupada'] },
        },
      });

      // Inactivas: Mantenimiento
      inactivas = await prisma.habitacion.count({
        where: { estado: 'Mantenimiento' },
      });
    }

    console.log(`📊 KPIs calculados: Total=${total}, Activas=${activas}, Inactivas=${inactivas}`);

    return res.status(200).json({
      total,
      activas,
      inactivas,
      criteria: {
        date: targetDate.toISOString().split('T')[0],
        incluirBloqueosVigentes: incluirBloqueos,
      },
    });

  } catch (error) {
    console.error('❌ Error al obtener KPIs:', error);
    return res.status(500).json({
      error: 'Error al obtener KPIs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Obtener detalle de una habitación por ID
 * GET /api/habitaciones/:id
 */
const getHabitacionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const habitacion = await prisma.habitacion.findUnique({
      where: { id },
      select: {
        id: true,
        numero: true,
        piso: true,
        estado: true,
        tipoHabitacion: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            tarifaBase: true,
            superficie: true,
            vista: true,
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
                descripcionCamas: true,
              },
            },
            imagenes: {
              select: {
                id: true,
                url: true,
                descripcion: true,
              },
              orderBy: {
                id: 'asc',
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
        },
      },
    });

    if (!habitacion) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }

    // Transformar amenidades
    const habitacionTransformada = {
      ...habitacion,
      tipoHabitacion: {
        ...habitacion.tipoHabitacion,
        amenidades: habitacion.tipoHabitacion.amenidades.map(a => a.amenidad),
      },
    };

    console.log(`🏨 Detalle de habitación ${habitacion.numero} enviado`);
    return res.status(200).json(habitacionTransformada);

  } catch (error) {
    console.error('❌ Error al obtener detalle de habitación:', error);
    return res.status(500).json({
      error: 'Error al obtener habitación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Actualizar estado de una habitación
 * PATCH /api/habitaciones/:id/estado
 */
const updateHabitacionEstado = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado } = req.body;

    // Validar ID
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Validar estado
    const estadosValidos = ['Disponible', 'Ocupada', 'Mantenimiento'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido', 
        estadosValidos 
      });
    }

    // Verificar que la habitación existe
    const habitacionExistente = await prisma.habitacion.findUnique({
      where: { id },
    });

    if (!habitacionExistente) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }

    // Actualizar estado
    const habitacionActualizada = await prisma.habitacion.update({
      where: { id },
      data: { estado },
      select: {
        id: true,
        numero: true,
        estado: true,
      },
    });

    // Crear evento de auditoría
    const tipoEvento = estado === 'Disponible' ? 'Apertura' : 'Mantenimiento';
    await prisma.habitacionEvento.create({
      data: {
        habitacionId: id,
        tipo: tipoEvento,
        detalle: `Cambio de estado a ${estado} desde detalle`,
        fecha: new Date(),
      },
    });

    console.log(`✅ Habitación ${habitacionActualizada.numero} cambiada a ${estado}`);

    return res.status(200).json(habitacionActualizada);

  } catch (error) {
    console.error('❌ Error al actualizar estado de habitación:', error);
    return res.status(500).json({
      error: 'Error al actualizar estado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Bloquear habitación con validaciones
 * POST /api/habitaciones/:id/bloquear
 */
const bloquearHabitacion = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { desde, hasta, motivo, tipo = 'Mantenimiento' } = req.body;

    // Validar ID
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Validar fechas requeridas
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Las fechas desde y hasta son requeridas' });
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    // Validar rango de fechas
    if (fechaDesde >= fechaHasta) {
      return res.status(400).json({ 
        error: 'La fecha "hasta" debe ser posterior a "desde"' 
      });
    }

    // Validar tipo de bloqueo
    const tiposValidos = ['Mantenimiento', 'FueraDeServicio', 'BloqueoOperativo'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo de bloqueo inválido',
        tiposValidos
      });
    }

    // Verificar que la habitación existe
    const habitacionExistente = await prisma.habitacion.findUnique({
      where: { id },
    });

    if (!habitacionExistente) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }

    // Validar solapamientos con otros bloqueos
    const bloqueosExistentes = await prisma.habitacionBloqueo.findMany({
      where: {
        habitacionId: id,
        OR: [
          // Caso 1: Bloqueo existente comienza durante el nuevo período
          {
            desde: {
              gte: fechaDesde,
              lt: fechaHasta,
            },
          },
          // Caso 2: Bloqueo existente termina durante el nuevo período
          {
            hasta: {
              gt: fechaDesde,
              lte: fechaHasta,
            },
          },
          // Caso 3: Bloqueo existente envuelve completamente al nuevo
          {
            AND: [
              { desde: { lte: fechaDesde } },
              { hasta: { gte: fechaHasta } },
            ],
          },
        ],
      },
    });

    if (bloqueosExistentes.length > 0) {
      return res.status(409).json({ 
        error: 'Ya existe un bloqueo en el período seleccionado',
        bloqueosConflicto: bloqueosExistentes.map(b => ({
          id: b.id,
          desde: b.desde,
          hasta: b.hasta,
          tipo: b.tipo,
        })),
      });
    }

    // Validar intersección con reservas activas
    const reservasActivas = await prisma.reservaHabitacion.findMany({
      where: {
        habitacionId: id,
        reserva: {
          estado: {
            in: ['Pendiente', 'Confirmada', 'CheckIn'],
          },
          OR: [
            // Reserva comienza durante el bloqueo
            {
              AND: [
                { fechaIngreso: { gte: fechaDesde } },
                { fechaIngreso: { lt: fechaHasta } },
              ],
            },
            // Reserva termina durante el bloqueo
            {
              AND: [
                { fechaEgreso: { gt: fechaDesde } },
                { fechaEgreso: { lte: fechaHasta } },
              ],
            },
            // Reserva envuelve al bloqueo
            {
              AND: [
                { fechaIngreso: { lte: fechaDesde } },
                { fechaEgreso: { gte: fechaHasta } },
              ],
            },
          ],
        },
      },
      include: {
        reserva: {
          select: {
            id: true,
            estado: true,
            fechaIngreso: true,
            fechaEgreso: true,
          },
        },
      },
    });

    if (reservasActivas.length > 0) {
      return res.status(409).json({ 
        error: 'Hay reservas activas en el período seleccionado',
        reservasConflicto: reservasActivas.map(r => ({
          reservaId: r.reserva.id,
          fechaIngreso: r.reserva.fechaIngreso,
          fechaEgreso: r.reserva.fechaEgreso,
          estado: r.reserva.estado,
        })),
      });
    }

    // Crear bloqueo
    const bloqueo = await prisma.habitacionBloqueo.create({
      data: {
        habitacionId: id,
        desde: fechaDesde,
        hasta: fechaHasta,
        motivo: motivo || `Bloqueo tipo ${tipo}`,
        tipo,
        creadoEn: new Date(),
      },
    });

    // Crear evento de auditoría
    await prisma.habitacionEvento.create({
      data: {
        habitacionId: id,
        tipo: 'Mantenimiento',
        detalle: `Bloqueo creado desde detalle: ${fechaDesde.toISOString().split('T')[0]} - ${fechaHasta.toISOString().split('T')[0]}`,
        fecha: new Date(),
      },
    });

    console.log(`✅ Bloqueo creado para habitación ${habitacionExistente.numero}`);

    return res.status(201).json({
      idBloqueo: bloqueo.id,
      habitacionId: bloqueo.habitacionId,
      desde: bloqueo.desde,
      hasta: bloqueo.hasta,
      motivo: bloqueo.motivo,
      tipo: bloqueo.tipo,
    });

  } catch (error) {
    console.error('❌ Error al bloquear habitación:', error);
    return res.status(500).json({
      error: 'Error al crear bloqueo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Obtener todos los bloqueos de habitaciones
 * GET /api/habitaciones/bloqueos?fechaDesde=2024-01-01&fechaHasta=2024-12-31
 */
const getAllBloqueos = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    // Construir filtro de fechas
    const where = {};
    if (fechaDesde || fechaHasta) {
      where.AND = [];
      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        where.AND.push({ hasta: { gte: desde } });
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        where.AND.push({ desde: { lte: hasta } });
      }
    }

    const bloqueos = await prisma.habitacionBloqueo.findMany({
      where,
      include: {
        habitacion: {
          select: {
            id: true,
            numero: true
          }
        }
      },
      orderBy: { desde: 'asc' }
    });

    console.log(`✅ Bloqueos obtenidos: ${bloqueos.length}`);

    return res.json(bloqueos);

  } catch (error) {
    console.error('❌ Error al obtener bloqueos:', error);
    return res.status(500).json({
      error: 'Error al obtener bloqueos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllHabitaciones,
  getHabitacionesKpis,
  getHabitacionById,
  updateHabitacionEstado,
  bloquearHabitacion,
  getAllBloqueos,
};
