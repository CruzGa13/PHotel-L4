import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/reservas/estados
 * Obtiene TODOS los valores del enum EstadoReserva
 */
export const getEstados = async (req, res) => {
  try {
    // Intentar obtener desde pg_enum (Postgres)
    const result = await prisma.$queryRaw`
      SELECT e.enumlabel AS value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'EstadoReserva'
      ORDER BY e.enumsortorder
    `;
    
    if (result && result.length > 0) {
      const estados = result.map(row => row.value);
      return res.json({ estados });
    }
    
    // Fallback: obtener estados únicos de reservas existentes
    const estadosData = await prisma.reserva.findMany({
      distinct: ['estado'],
      select: { estado: true },
      orderBy: { estado: 'asc' }
    });
    const estados = estadosData.map(e => e.estado);
    
    return res.json({ estados });

  } catch (error) {
    console.error('[getEstados] Error:', error);
    // Fallback manual si falla todo
    return res.json({ 
      estados: ['Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada'] 
    });
  }
};

/**
 * GET /api/reservas/filters
 * Obtiene tipos de habitación para filtros
 */
export const getFilters = async (req, res) => {
  try {
    // Obtener tipos de habitación únicos
    const tiposData = await prisma.tipoHabitacion.findMany({
      select: { nombre: true },
      orderBy: { nombre: 'asc' }
    });
    const tiposHabitacion = tiposData.map(t => t.nombre);

    return res.json({
      tiposHabitacion
    });

  } catch (error) {
    console.error('[getFilters] Error:', error);
    return res.status(500).json({
      error: 'Error al obtener filtros',
      message: error.message
    });
  }
};

/**
 * GET /api/reservas
 * Lista reservas con filtros, búsqueda, paginación y ordenamiento
 */
export const listReservas = async (req, res) => {
  try {
    const {
      q,                         // Búsqueda general
      estado,                    // Filtro por estado
      tipoHabitacion,            // Filtro por tipo de habitación
      fechaDesde,                // Filtro fecha desde (YYYY-MM-DD)
      fechaHasta,                // Filtro fecha hasta (YYYY-MM-DD)
      page,
      pageSize,
      sortBy,
      sortDir
    } = req.query;

    // Normalizar paginación
    const p = Math.max(1, parseInt(page ?? '1', 10));
    const ps = Math.max(1, Math.min(100, parseInt(pageSize ?? '50', 10)));
    const skip = (p - 1) * ps;

    // Construir where - solo agregar filtros con valores reales
    const where = {};

    // Filtro por estado (solo si tiene valor y no es 'Todos')
    if (estado && estado.trim() && estado !== 'Todos') {
      where.estado = estado.trim();
    }

    // Búsqueda general (q): busca en múltiples campos
    if (q && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        // Buscar en cliente (nombre, apellido, id/email)
        {
          cliente: {
            nombre: { contains: searchTerm, mode: 'insensitive' }
          }
        },
        {
          cliente: {
            apellido: { contains: searchTerm, mode: 'insensitive' }
          }
        },
        {
          cliente: {
            id: { contains: searchTerm, mode: 'insensitive' }
          }
        },
        // Buscar en contactoEmail
        { contactoEmail: { contains: searchTerm, mode: 'insensitive' } },
        // Buscar en habitaciones → numero
        {
          habitaciones: {
            some: {
              habitacion: {
                numero: { contains: searchTerm, mode: 'insensitive' }
              }
            }
          }
        },
        // Buscar en habitaciones → tipoHabitacion → nombre
        {
          habitaciones: {
            some: {
              habitacion: {
                tipoHabitacion: {
                  nombre: { contains: searchTerm, mode: 'insensitive' }
                }
              }
            }
          }
        }
      ];
    }

    // Filtro por tipo de habitación
    if (tipoHabitacion && tipoHabitacion.trim() && tipoHabitacion !== 'Todos') {
      where.habitaciones = {
        some: {
          habitacion: {
            tipoHabitacion: {
              nombre: { equals: tipoHabitacion.trim() }
            }
          }
        }
      };
    }

    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      where.AND = where.AND ?? [];
      
      if (fechaDesde && fechaDesde.trim()) {
        try {
          const desde = new Date(fechaDesde);
          desde.setHours(0, 0, 0, 0);
          where.AND.push({ fechaIngreso: { gte: desde } });
        } catch (err) {
          console.warn('[listReservas] fechaDesde inválido:', fechaDesde);
        }
      }
      
      if (fechaHasta && fechaHasta.trim()) {
        try {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          where.AND.push({ fechaEgreso: { lte: hasta } });
        } catch (err) {
          console.warn('[listReservas] fechaHasta inválido:', fechaHasta);
        }
      }
    }

    // Construir orderBy
    const sortField = sortBy || 'fechaIngreso';
    const sortDirection = sortDir === 'asc' ? 'asc' : 'desc';
    let orderBy = {};
    
    if (sortField === 'checkIn' || sortField === 'fechaIngreso') {
      orderBy.fechaIngreso = sortDirection;
    } else if (sortField === 'checkOut' || sortField === 'fechaEgreso') {
      orderBy.fechaEgreso = sortDirection;
    } else if (sortField === 'createdAt' || sortField === 'creadaEn') {
      orderBy.creadaEn = sortDirection;
    } else {
      orderBy.fechaIngreso = 'desc'; // Default
    }

    // Ejecutar count y findMany en paralelo
    const [total, data] = await Promise.all([
      prisma.reserva.count({ where }),
      prisma.reserva.findMany({
        where,
        skip,
        take: ps,
        orderBy,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              telefono: true,
              direccion: true
            }
          },
          habitaciones: {
            include: {
              habitacion: {
                include: {
                  tipoHabitacion: {
                    select: {
                      id: true,
                      nombre: true,
                      descripcion: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    // Mapear al DTO esperado
    const rows = data.map(r => {
      // Tomar el email del contactoEmail o del cliente
      const email = r.contactoEmail || r.cliente?.id || '';
      
      // Tomar el nombre del cliente
      const huesped = `${r.cliente?.nombre || ''} ${r.cliente?.apellido || ''}`.trim() || 'Sin nombre';
      
      // Tomar la primera habitación (pueden ser múltiples en una reserva)
      const primeraHabitacion = r.habitaciones?.[0];
      const tipoHabitacion = primeraHabitacion?.habitacion?.tipoHabitacion?.nombre || 'N/A';
      const habitacion = primeraHabitacion?.habitacion?.numero || 'N/A';

      // Si hay múltiples habitaciones, agregar contador
      const habitacionDisplay = r.habitaciones.length > 1 
        ? `${habitacion} (+${r.habitaciones.length - 1})`
        : habitacion;

      return {
        id: r.id,
        codigo: String(r.id), // No hay campo codigo en el schema
        huesped,
        email,
        // Campos compatibles con TablaReserva (frontend)
        numeroHabitacion: habitacionDisplay,
        nombreHabitacion: tipoHabitacion,
        checkIn: r.fechaIngreso?.toISOString?.().split('T')[0] || r.fechaIngreso,
        checkOut: r.fechaEgreso?.toISOString?.().split('T')[0] || r.fechaEgreso,
        total: `$${Number(r.totalFinal ?? 0).toLocaleString('es-AR')}`,
        estado: r.estado,
        // Datos adicionales para el detalle
        adultos: r.adultos,
        ninios: r.ninios,
        totalHabitaciones: r.habitaciones.length,
        observaciones: primeraHabitacion?.observaciones || null,
        // Mantener valores numéricos para cálculos
        totalNumerico: Number(r.totalFinal ?? 0)
      };
    });

    return res.json({
      page: p,
      pageSize: ps,
      total,
      rows
    });

  } catch (error) {
    console.error('[listReservas] Error:', error);
    return res.status(500).json({
      error: 'Error al obtener reservas',
      message: error.message
    });
  }
};

/**
 * GET /api/reservas/:id
 * Obtiene el detalle completo de una reserva específica
 */
export const getReservaById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservaId = parseInt(id, 10);

    if (isNaN(reservaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'El ID de la reserva debe ser un número'
      });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            direccion: true
          }
        },
        habitaciones: {
          include: {
            habitacion: {
              include: {
                tipoHabitacion: {
                  select: {
                    id: true,
                    nombre: true,
                    descripcion: true
                  }
                }
              }
            }
          }
        },
        factura: true // ⬅️ CRÍTICO: Incluir factura para mostrar botón PDF
      }
    });

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        message: `No existe reserva con ID ${reservaId}`
      });
    }

    // Mapear al mismo formato que listReservas para compatibilidad
    const email = reserva.contactoEmail || reserva.cliente?.id || '';
    const huesped = `${reserva.cliente?.nombre || ''} ${reserva.cliente?.apellido || ''}`.trim() || 'Sin nombre';
    const primeraHabitacion = reserva.habitaciones?.[0];
    const tipoHabitacion = primeraHabitacion?.habitacion?.tipoHabitacion?.nombre || 'N/A';
    const habitacion = primeraHabitacion?.habitacion?.numero || 'N/A';
    const habitacionDisplay = reserva.habitaciones.length > 1 
      ? `${habitacion} (+${reserva.habitaciones.length - 1})`
      : habitacion;

    const reservaFormateada = {
      id: reserva.id,
      codigo: String(reserva.id),
      huesped,
      email,
      numeroHabitacion: habitacionDisplay,
      nombreHabitacion: tipoHabitacion,
      checkIn: reserva.fechaIngreso?.toISOString?.().split('T')[0] || reserva.fechaIngreso,
      checkOut: reserva.fechaEgreso?.toISOString?.().split('T')[0] || reserva.fechaEgreso,
      total: `$${Number(reserva.totalFinal ?? 0).toLocaleString('es-AR')}`,
      estado: reserva.estado,
      adultos: reserva.adultos,
      ninios: reserva.ninios,
      totalHabitaciones: reserva.habitaciones.length,
      observaciones: primeraHabitacion?.observaciones || null,
      totalNumerico: Number(reserva.totalFinal ?? 0),
      factura: reserva.factura // ⬅️ Incluir factura completa
    };

    console.log('[getReservaById] Reserva encontrada:', {
      id: reserva.id,
      estado: reserva.estado,
      tieneFactura: !!reserva.factura,
      estadoFactura: reserva.factura?.estado
    });

    return res.json(reservaFormateada);

  } catch (error) {
    console.error('[getReservaById] Error:', error);
    return res.status(500).json({
      error: 'Error al obtener reserva',
      message: error.message
    });
  }
};

/**
 * PATCH /api/reservas/:id/estado
 * Actualiza el estado de una reserva y registra el cambio en ReservaMovimiento
 */
export const updateEstadoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, operadorId } = req.body;

    // Validar estado
    const estadosValidos = ['Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: `Estado debe ser uno de: ${estadosValidos.join(', ')}`
      });
    }

    const reservaId = parseInt(id, 10);

    // Obtener el estado actual antes de actualizar (incluir factura para validaciones)
    const reservaActual = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { factura: true }
    });

    if (!reservaActual) {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        message: `No existe reserva con ID ${reservaId}`
      });
    }

    // Validar que no sea el mismo estado
    if (reservaActual.estado === estado) {
      return res.status(400).json({
        error: 'Estado duplicado',
        message: 'La reserva ya está en ese estado'
      });
    }

    // 🚫 VALIDACIÓN DE NEGOCIO: No permitir confirmar sin pago acreditado
    if (estado === 'Confirmada') {
      const tieneFactura = !!reservaActual.factura;
      const facturaPagada = tieneFactura && reservaActual.factura.estado === 'Pagada';
      
      if (!facturaPagada) {
        console.warn('[updateEstadoReserva] Intento de confirmar sin factura pagada:', {
          reservaId,
          tieneFactura,
          estadoFactura: reservaActual.factura?.estado || 'sin factura'
        });
        
        return res.status(409).json({
          error: 'No se puede confirmar una reserva sin pago acreditado',
          message: 'Para confirmar la reserva, primero debe procesarse el pago mediante Stripe.',
          requierePago: true
        });
      }
      
      console.log('[updateEstadoReserva] Validación de pago exitosa:', {
        reservaId,
        facturaId: reservaActual.factura.id,
        numeroFactura: reservaActual.factura.numeroFactura
      });
    }

    // Validar transiciones lógicas
    const transicionesValidas = {
      'Pendiente': ['Confirmada', 'Cancelada'],
      'Confirmada': ['CheckIn', 'Cancelada'],
      'CheckIn': ['CheckOut'],
      'CheckOut': [], // Estado final
      'Cancelada': [] // Estado final
    };

    const estadoActual = reservaActual.estado;
    const transicionesPermitidas = transicionesValidas[estadoActual] || [];

    if (!transicionesPermitidas.includes(estado)) {
      return res.status(400).json({
        error: 'Transición de estado no permitida',
        message: `No se puede cambiar de "${estadoActual}" a "${estado}". Transiciones permitidas: ${transicionesPermitidas.join(', ') || 'ninguna (estado final)'}`
      });
    }

    // Usar transacción para actualizar estado y crear registro de movimiento
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el estado de la reserva
      const reservaActualizada = await tx.reserva.update({
        where: { id: reservaId },
        data: { estado }
      });

      // 2. Crear registro en ReservaMovimiento
      const movimiento = await tx.reservaMovimiento.create({
        data: {
          reservaId: reservaId,
          estadoAnt: estadoActual,
          estadoNuevo: estado,
          operadorId: operadorId || null // Si no se proporciona, será null
        }
      });

      return { reservaActualizada, movimiento };
    });

    console.log('[updateEstadoReserva] Cambio registrado:', {
      reservaId,
      estadoAnterior: estadoActual,
      estadoNuevo: estado,
      movimientoId: resultado.movimiento.id
    });

    return res.json({
      success: true,
      reserva: {
        id: resultado.reservaActualizada.id,
        estado: resultado.reservaActualizada.estado,
        estadoAnterior: estadoActual
      },
      movimiento: {
        id: resultado.movimiento.id,
        cambiadoEn: resultado.movimiento.cambiadoEn
      }
    });

  } catch (error) {
    console.error('[updateEstadoReserva] Error:', error);
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        message: 'La reserva especificada no existe'
      });
    }

    return res.status(500).json({
      error: 'Error al actualizar estado de reserva',
      message: error.message
    });
  }
};

/**
 * GET /api/reservas/:id/historial
 * Obtiene el historial de movimientos (cambios de estado) de una reserva
 */
export const getHistorialReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reservaId = parseInt(id, 10);

    // Verificar que la reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { id: true, estado: true }
    });

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        message: `No existe reserva con ID ${reservaId}`
      });
    }

    // Obtener todos los movimientos de la reserva, ordenados por fecha
    const movimientos = await prisma.reservaMovimiento.findMany({
      where: { reservaId },
      orderBy: { cambiadoEn: 'desc' },
      select: {
        id: true,
        estadoAnt: true,
        estadoNuevo: true,
        cambiadoEn: true,
        operadorId: true
      }
    });

    // Formatear los datos para el frontend
    const historial = movimientos.map(m => ({
      id: m.id,
      accion: `Cambio de ${m.estadoAnt} a ${m.estadoNuevo}`,
      estadoAnterior: m.estadoAnt,
      estadoNuevo: m.estadoNuevo,
      fecha: m.cambiadoEn.toLocaleDateString('es-AR'),
      hora: m.cambiadoEn.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      fechaCompleta: m.cambiadoEn,
      operador: m.operadorId || 'Sistema'
    }));

    return res.json({
      reservaId,
      estadoActual: reserva.estado,
      totalMovimientos: historial.length,
      historial
    });

  } catch (error) {
    console.error('[getHistorialReserva] Error:', error);
    return res.status(500).json({
      error: 'Error al obtener historial de reserva',
      message: error.message
    });
  }
};
