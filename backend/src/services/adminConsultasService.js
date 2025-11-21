const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Servicio para consultas y reportes del administrador
 * Maneja filtros, agregaciones y cálculos de KPIs
 */

/**
 * Obtiene resumen con KPIs y datos para gráficos
 * @param {Object} filtros - { from, to, tipoHabitacionId, estado, operadorId }
 * @returns {Object} - { kpis, graficos }
 */
async function obtenerResumen(filtros) {
  const { from, to, tipoHabitacionId, estado, operadorId } = filtros;

  console.log('📈 Obteniendo resumen con filtros:', filtros);

  // Construir condiciones WHERE
  const whereConditions = {};

  // Filtro por fechas
  if (from || to) {
    whereConditions.fechaIngreso = {};
    if (from) whereConditions.fechaIngreso.gte = new Date(from);
    if (to) whereConditions.fechaIngreso.lte = new Date(to);
  }

  // Filtro por estado (enum EstadoReserva)
  if (estado && estado !== 'Todos') {
    whereConditions.estado = estado;
  }

  // Filtro por operador/administrador
  if (operadorId && operadorId !== 'Todos') {
    whereConditions.administradorId = operadorId;
  }

  // Obtener todas las reservas con relaciones
  const reservas = await prisma.reserva.findMany({
    where: whereConditions,
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
      administrador: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
      habitaciones: {
        include: {
          habitacion: {
            include: {
              tipoHabitacion: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
      factura: {
        include: {
          metodoPago: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
  });

  // Filtrar por tipo de habitación si se especifica
  let reservasFiltradas = reservas;
  if (tipoHabitacionId && tipoHabitacionId !== 'Todos') {
    reservasFiltradas = reservas.filter((reserva) =>
      reserva.habitaciones.some(
        (rh) => rh.habitacion.tipoHabitacion.id === parseInt(tipoHabitacionId)
      )
    );
  }

  // ========================================
  // CALCULAR KPIs
  // ========================================

  const totalReservas = reservasFiltradas.length;
  const reservasCanceladas = reservasFiltradas.filter(
    (r) => r.estado === 'Cancelada'
  ).length;
  const tasaCancelacion =
    totalReservas > 0 ? ((reservasCanceladas / totalReservas) * 100).toFixed(1) : '0.0';

  // Ingresos totales (suma de totalFinal de reservas no canceladas)
  const ingresosTotales = reservasFiltradas
    .filter((r) => r.estado !== 'Cancelada')
    .reduce((sum, r) => sum + (parseFloat(r.totalFinal) || 0), 0);

  // Ocupación promedio (mejorada)
  // Total de habitaciones en el sistema (solo disponibles y ocupadas, no en mantenimiento)
  const totalHabitaciones = await prisma.habitacion.count({
    where: {
      estado: {
        in: ['Disponible', 'Ocupada'],
      },
    },
  });

  // Calcular días del período
  const fechaDesde = from ? new Date(from) : new Date();
  const fechaHasta = to ? new Date(to) : new Date();
  const diasPeriodo = Math.max(
    1,
    Math.ceil((fechaHasta - fechaDesde) / (1000 * 60 * 60 * 24)) + 1
  );

  // Calcular habitaciones-noche ocupadas
  // Para cada reserva activa, contar: cantidad de habitaciones × días de estadía
  let habitacionesNocheOcupadas = 0;
  
  reservasFiltradas
    .filter((r) => r.estado !== 'Cancelada' && r.estado !== 'Pendiente')
    .forEach((reserva) => {
      const cantidadHabitaciones = reserva.habitaciones.length;
      const diasEstadia = Math.max(
        1,
        Math.ceil(
          (new Date(reserva.fechaEgreso) - new Date(reserva.fechaIngreso)) / (1000 * 60 * 60 * 24)
        )
      );
      habitacionesNocheOcupadas += cantidadHabitaciones * diasEstadia;
    });

  // Capacidad total del hotel en el período
  const capacidadTotal = totalHabitaciones * diasPeriodo;

  const ocupacionPromedio =
    capacidadTotal > 0
      ? ((habitacionesNocheOcupadas / capacidadTotal) * 100).toFixed(1)
      : '0.0';

  console.log('📊 Cálculo de ocupación:', {
    totalHabitaciones,
    diasPeriodo,
    habitacionesNocheOcupadas,
    capacidadTotal,
    ocupacionPromedio: `${ocupacionPromedio}%`,
  });

  // ========================================
  // DATOS PARA GRÁFICOS
  // ========================================

  // 1. Ingresos por día
  const ingresosPorDiaMap = {};
  reservasFiltradas
    .filter((r) => r.estado !== 'Cancelada')
    .forEach((reserva) => {
      const fecha = reserva.fechaIngreso.toISOString().split('T')[0];
      if (!ingresosPorDiaMap[fecha]) {
        ingresosPorDiaMap[fecha] = 0;
      }
      ingresosPorDiaMap[fecha] += parseFloat(reserva.totalFinal) || 0;
    });

  const ingresosPorDia = Object.keys(ingresosPorDiaMap)
    .sort()
    .map((fecha) => ({
      fecha,
      total: ingresosPorDiaMap[fecha],
    }));

  // 2. Reservas por tipo de habitación
  const reservasPorTipoMap = {};
  reservasFiltradas.forEach((reserva) => {
    reserva.habitaciones.forEach((rh) => {
      const tipoNombre = rh.habitacion.tipoHabitacion.nombre;
      if (!reservasPorTipoMap[tipoNombre]) {
        reservasPorTipoMap[tipoNombre] = 0;
      }
      reservasPorTipoMap[tipoNombre]++;
    });
  });

  const reservasPorTipo = Object.keys(reservasPorTipoMap).map((tipo) => ({
    tipoHabitacionNombre: tipo,
    cantidad: reservasPorTipoMap[tipo],
  }));

  // 3. Estados de reservas
  const estadosReservaMap = {};
  reservasFiltradas.forEach((reserva) => {
    if (!estadosReservaMap[reserva.estado]) {
      estadosReservaMap[reserva.estado] = 0;
    }
    estadosReservaMap[reserva.estado]++;
  });

  const estadosReserva = Object.keys(estadosReservaMap).map((estado) => ({
    estado,
    cantidad: estadosReservaMap[estado],
  }));

  const resultado = {
    kpis: {
      ocupacionPromedio,
      ingresosTotales,
      totalReservas,
      tasaCancelacion,
    },
    graficos: {
      ingresosPorDia,
      reservasPorTipo,
      estadosReserva,
    },
  };

  console.log('✅ Resumen calculado:', {
    totalReservas,
    ingresosPorDia: ingresosPorDia.length,
    reservasPorTipo: reservasPorTipo.length,
    estadosReserva: estadosReserva.length,
  });

  return resultado;
}

/**
 * Obtiene detalle de reservas con paginación
 * @param {Object} filtros - { from, to, tipoHabitacionId, estado, operadorId, busquedaCliente, metodoPago }
 * @param {Number} page - Número de página (1-indexed)
 * @param {Number} pageSize - Tamaño de página
 * @returns {Object} - { items, totalItems, page, pageSize }
 */
async function obtenerReservasDetalle(filtros, page = 1, pageSize = 10) {
  const { from, to, tipoHabitacionId, estado, operadorId, busquedaCliente, metodoPago } =
    filtros;

  // Construir condiciones WHERE
  const whereConditions = {};

  // Filtro por fechas
  if (from || to) {
    whereConditions.fechaIngreso = {};
    if (from) whereConditions.fechaIngreso.gte = new Date(from);
    if (to) whereConditions.fechaIngreso.lte = new Date(to);
  }

  // Filtro por estado (enum EstadoReserva)
  if (estado && estado !== 'Todos') {
    whereConditions.estado = estado;
  }

  // Filtro por operador/administrador
  if (operadorId && operadorId !== 'Todos') {
    whereConditions.administradorId = operadorId;
  }

  // Filtro por búsqueda de cliente (nombre, apellido o email)
  // Nota: El email está en contactoEmail de la reserva, no en Usuario
  if (busquedaCliente) {
    // Si ya hay otros filtros, usar AND para combinar
    const searchConditions = {
      OR: [
        {
          cliente: {
            nombre: { contains: busquedaCliente, mode: 'insensitive' },
          },
        },
        {
          cliente: {
            apellido: { contains: busquedaCliente, mode: 'insensitive' },
          },
        },
        {
          contactoEmail: { contains: busquedaCliente, mode: 'insensitive' },
        },
      ],
    };

    // Combinar con los filtros existentes
    if (Object.keys(whereConditions).length > 0) {
      whereConditions.AND = [searchConditions];
    } else {
      Object.assign(whereConditions, searchConditions);
    }
  }

  // Log de condiciones para debug
  console.log('🔍 WHERE conditions:', JSON.stringify(whereConditions, null, 2));

  // Obtener reservas con relaciones
  const reservas = await prisma.reserva.findMany({
    where: whereConditions,
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
      administrador: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
      habitaciones: {
        include: {
          habitacion: {
            include: {
              tipoHabitacion: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
      factura: {
        include: {
          metodoPago: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: {
      fechaIngreso: 'desc',
    },
  });

  // Filtrar por tipo de habitación si se especifica
  let reservasFiltradas = reservas;
  if (tipoHabitacionId && tipoHabitacionId !== 'Todos') {
    reservasFiltradas = reservas.filter((reserva) =>
      reserva.habitaciones.some(
        (rh) => rh.habitacion.tipoHabitacion.id === parseInt(tipoHabitacionId)
      )
    );
  }

  // Filtrar por método de pago si se especifica
  if (metodoPago && metodoPago !== 'Todos') {
    reservasFiltradas = reservasFiltradas.filter(
      (reserva) => reserva.factura?.metodoPago?.nombre === metodoPago
    );
  }

  const totalItems = reservasFiltradas.length;

  // Aplicar paginación
  const skip = (page - 1) * pageSize;
  const reservasPaginadas = reservasFiltradas.slice(skip, skip + pageSize);

  // Mapear a DTO plano
  const items = reservasPaginadas.map((reserva) => ({
    id: reserva.id,
    fechaIngreso: reserva.fechaIngreso,
    fechaEgreso: reserva.fechaEgreso,
    estado: reserva.estado,
    totalFinal: parseFloat(reserva.totalFinal) || 0,
    cliente: {
      id: reserva.cliente.id,
      nombreCompleto: `${reserva.cliente.nombre} ${reserva.cliente.apellido || ''}`.trim(),
      email: reserva.contactoEmail || 'N/A',
    },
    operador: reserva.administrador
      ? {
          id: reserva.administrador.id,
          nombreCompleto: `${reserva.administrador.nombre} ${reserva.administrador.apellido || ''}`.trim(),
        }
      : null,
    tipoHabitaciones: reserva.habitaciones.map((rh) => ({
      id: rh.habitacion.tipoHabitacion.id,
      nombre: rh.habitacion.tipoHabitacion.nombre,
    })),
    metodoPago: reserva.factura?.metodoPago?.nombre || 'N/A',
  }));

  return {
    items,
    totalItems,
    page,
    pageSize,
  };
}

/**
 * Obtiene todas las reservas sin paginación (para PDF)
 * @param {Object} filtros
 * @returns {Array} - Lista completa de reservas
 */
async function obtenerTodasLasReservas(filtros) {
  const resultado = await obtenerReservasDetalle(filtros, 1, 999999);
  return resultado.items;
}

module.exports = {
  obtenerResumen,
  obtenerReservasDetalle,
  obtenerTodasLasReservas,
};
