import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtener lista de reservas con filtros, búsqueda, paginación y ordenamiento
 * @param {Object} params - Parámetros de filtrado y paginación
 * @param {string} params.q - Búsqueda general (opcional)
 * @param {string} params.estado - Filtro por estado (opcional)
 * @param {string} params.tipoHabitacion - Filtro por tipo de habitación (opcional)
 * @param {string} params.fechaDesde - Filtro fecha desde YYYY-MM-DD (opcional)
 * @param {string} params.fechaHasta - Filtro fecha hasta YYYY-MM-DD (opcional)
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.pageSize - Tamaño de página (default: 50)
 * @param {string} params.sortBy - Campo de ordenamiento (default: 'fechaIngreso')
 * @param {string} params.sortDir - Dirección (asc/desc, default: 'desc')
 * @returns {Promise<{page, pageSize, total, rows}>}
 */
export const listReservas = async (params = {}) => {
  const { 
    page = 1, 
    pageSize = 50, 
    sortBy = 'fechaIngreso', 
    sortDir = 'desc',
    q,
    estado,
    tipoHabitacion,
    fechaDesde,
    fechaHasta
  } = params;
  
  // Construir parámetros solo con valores presentes
  const queryParams = { page, pageSize, sortBy, sortDir };
  if (q) queryParams.q = q;
  if (estado) queryParams.estado = estado;
  if (tipoHabitacion) queryParams.tipoHabitacion = tipoHabitacion;
  if (fechaDesde) queryParams.fechaDesde = fechaDesde;
  if (fechaHasta) queryParams.fechaHasta = fechaHasta;
  
  const fullUrl = `${API_BASE_URL}/reservas`;
  console.log('🔍 Llamando a:', fullUrl, queryParams);
  
  try {
    const response = await axios.get(fullUrl, { params: queryParams });
    console.log('✅ Respuesta recibida:', response.data);
    console.log(`✅ Página ${response.data.page}, mostrando ${response.data.rows?.length || 0} de ${response.data.total}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener reservas:', error);
    console.error('❌ Error.response:', error.response);
    
    if (error.response) {
      throw new Error(error.response.data?.error || 'Error al obtener reservas');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error('Error al procesar la solicitud');
    }
  }
};

/**
 * Obtener detalle de una reserva por ID
 * @param {number} id - ID de la reserva
 * @returns {Promise<Object>}
 */
export const getReservaById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reservas/${id}`);
    console.log('✅ Detalle de reserva obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener detalle de reserva:', error);
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    }
    throw new Error('Error al obtener detalle de reserva');
  }
};

/**
 * Obtener estados disponibles para reservas
 * @returns {Promise<{estados: string[]}>}
 */
export const getEstadosReserva = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reservas/estados`);
    console.log('✅ Estados obtenidos:', response.data.estados);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener estados:', error);
    throw new Error('Error al obtener estados de reserva');
  }
};

/**
 * Obtener filtros disponibles (tipos de habitación, etc.)
 * @returns {Promise<{tiposHabitacion: string[]}>}
 */
export const getFiltersReserva = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reservas/filters`);
    console.log('✅ Filtros obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener filtros:', error);
    throw new Error('Error al obtener filtros de reserva');
  }
};

/**
 * Actualizar estado de una reserva
 * @param {number} id - ID de la reserva
 * @param {string} estado - Nuevo estado
 * @param {string} operadorId - ID del operador (opcional)
 * @returns {Promise<Object>}
 */
export const updateEstadoReserva = async (id, estado, operadorId = null) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/reservas/${id}/estado`, {
      estado,
      operadorId
    });
    console.log(`✅ Estado de reserva ${id} actualizado a ${estado}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar estado de reserva:', error);
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Estado inválido');
    }
    if (error.response?.status === 409) {
      throw new Error(error.response.data.error || 'No se puede cambiar el estado');
    }
    throw new Error('Error al actualizar estado de reserva');
  }
};

/**
 * Obtener historial de movimientos de una reserva
 * @param {number} id - ID de la reserva
 * @returns {Promise<Object>}
 */
export const getHistorialReserva = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reservas/${id}/historial`);
    console.log('✅ Historial obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    }
    throw new Error('Error al obtener historial de reserva');
  }
};

export default {
  listReservas,
  getReservaById,
  getEstadosReserva,
  getFiltersReserva,
  updateEstadoReserva,
  getHistorialReserva,
};
