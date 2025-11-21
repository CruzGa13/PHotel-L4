const adminConsultasService = require('../services/adminConsultasService');

/**
 * GET /api/admin/consultas/resumen
 * Obtiene KPIs y datos para gráficos según filtros
 * 
 * Query params:
 * - from: fecha desde (ISO string)
 * - to: fecha hasta (ISO string)
 * - tipoHabitacionId: ID del tipo de habitación o 'Todos'
 * - estado: estado de reserva o 'Todos'
 * - operadorId: ID del operador/administrador o 'Todos'
 */
const obtenerResumen = async (req, res) => {
  try {
    const { from, to, tipoHabitacionId, estado, operadorId } = req.query;

    console.log('📈 Obteniendo resumen con query params:', req.query);

    const filtros = {
      from,
      to,
      tipoHabitacionId,
      estado,
      operadorId,
    };

    const resultado = await adminConsultasService.obtenerResumen(filtros);

    console.log('✅ Resumen obtenido exitosamente');

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error en obtenerResumen:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Error al obtener resumen',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * GET /api/admin/consultas/reservas
 * Obtiene lista paginada de reservas según filtros
 * 
 * Query params:
 * - from, to, tipoHabitacionId, estado, operadorId (igual que resumen)
 * - busquedaCliente: texto para buscar en nombre/apellido/email del cliente
 * - metodoPago: nombre del método de pago o 'Todos'
 * - page: número de página (default: 1)
 * - pageSize: tamaño de página (default: 10)
 */
const obtenerReservas = async (req, res) => {
  try {
    const {
      from,
      to,
      tipoHabitacionId,
      estado,
      operadorId,
      busquedaCliente,
      metodoPago,
      page = 1,
      pageSize = 10,
    } = req.query;

    console.log('📊 Obteniendo reservas con filtros:', {
      from,
      to,
      tipoHabitacionId,
      estado,
      operadorId,
      busquedaCliente,
      metodoPago,
      page,
      pageSize,
    });

    const filtros = {
      from,
      to,
      tipoHabitacionId,
      estado,
      operadorId,
      busquedaCliente,
      metodoPago,
    };

    const resultado = await adminConsultasService.obtenerReservasDetalle(
      filtros,
      parseInt(page),
      parseInt(pageSize)
    );

    console.log('✅ Reservas obtenidas:', resultado.totalItems, 'total');

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error en obtenerReservas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Error al obtener reservas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

module.exports = {
  obtenerResumen,
  obtenerReservas,
};
