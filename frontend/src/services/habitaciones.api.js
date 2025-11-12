import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtener lista de habitaciones con paginación, ordenamiento y filtros
 * @param {Object} params - Parámetros de paginación, ordenamiento y filtros
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.pageSize - Tamaño de página (default: 10)
 * @param {string} params.orderBy - Campo de ordenamiento (default: 'numero')
 * @param {string} params.dir - Dirección (asc/desc, default: 'asc')
 * @param {string} params.q - Búsqueda por número o tipo (opcional)
 * @param {number} params.categoriaId - Filtrar por categoría (opcional)
 * @param {number} params.tipoHabitacionId - Filtrar por tipo (opcional)
 * @param {number} params.capacidad - Filtrar por capacidad mínima (opcional)
 * @returns {Promise<{items: HabitacionDTO[], page, pageSize, total, totalPages}>}
 */
export const listHabitaciones = async (params = {}) => {
  const { page = 1, pageSize = 10, orderBy = 'numero', dir = 'asc', q, categoriaId, tipoHabitacionId, capacidad } = params;
  
  // Construir parámetros solo con valores presentes
  const queryParams = { page, pageSize, orderBy, dir };
  if (q) queryParams.q = q;
  if (categoriaId) queryParams.categoriaId = categoriaId;
  if (tipoHabitacionId) queryParams.tipoHabitacionId = tipoHabitacionId;
  if (capacidad) queryParams.capacidad = capacidad;
  
  const fullUrl = `${API_BASE_URL}/habitaciones`;
  console.log('🔍 Llamando a:', fullUrl, queryParams);
  
  try {
    const response = await axios.get(fullUrl, { params: queryParams });
    console.log('✅ Respuesta recibida:', response.data);
    console.log(`✅ Página ${response.data.page}/${response.data.totalPages}, mostrando ${response.data.items?.length || 0} de ${response.data.total}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener habitaciones:', error);
    console.error('❌ Error.response:', error.response);
    
    if (error.response) {
      throw new Error(error.response.data?.error || 'Error al obtener habitaciones');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error('Error al procesar la solicitud');
    }
  }
};

/**
 * Obtener lista de categorías
 * @returns {Promise<Array<{id, nombre}>>}
 */
export const getCategorias = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categorias`);
    console.log('✅ Categorías obtenidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    throw new Error('Error al obtener categorías');
  }
};

/**
 * Obtener lista de tipos de habitación
 * @returns {Promise<Array<{id, nombre}>>}
 */
export const getTiposHabitacion = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tipos-habitacion`);
    console.log('✅ Tipos de habitación obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener tipos de habitación:', error);
    throw new Error('Error al obtener tipos de habitación');
  }
};

/**
 * Obtener KPIs de habitaciones
 * @param {Object} params - Parámetros opcionales
 * @param {string} params.date - Fecha en formato YYYY-MM-DD (opcional)
 * @param {boolean} params.incluirBloqueosVigentes - Incluir bloqueos vigentes (opcional)
 * @returns {Promise<{total, activas, inactivas, criteria}>}
 */
export const getHabitacionesKpis = async (params = {}) => {
  try {
    const queryParams = {};
    if (params.date) queryParams.date = params.date;
    if (params.incluirBloqueosVigentes !== undefined) {
      queryParams.incluirBloqueosVigentes = params.incluirBloqueosVigentes;
    }

    const response = await axios.get(`${API_BASE_URL}/habitaciones/kpis`, {
      params: queryParams,
    });
    console.log('📊 KPIs obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener KPIs:', error);
    throw new Error('Error al obtener KPIs de habitaciones');
  }
};

/**
 * Obtener detalle de una habitación por ID
 * @param {number} id - ID de la habitación
 * @returns {Promise<Object>}
 */
export const getHabitacionById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/habitaciones/${id}`);
    console.log('✅ Detalle de habitación obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener detalle de habitación:', error);
    if (error.response?.status === 404) {
      throw new Error('Habitación no encontrada');
    }
    throw new Error('Error al obtener detalle de habitación');
  }
};

/**
 * Actualizar estado de una habitación
 * @param {number} id - ID de la habitación
 * @param {string} estado - Nuevo estado ("Disponible" | "Ocupada" | "Mantenimiento")
 * @returns {Promise<Object>}
 */
export const updateHabitacionEstado = async (id, estado) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/habitaciones/${id}/estado`, { estado });
    console.log(`✅ Estado de habitación ${id} actualizado a ${estado}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar estado de habitación:', error);
    if (error.response?.status === 404) {
      throw new Error('Habitación no encontrada');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Estado inválido');
    }
    throw new Error('Error al actualizar estado de habitación');
  }
};

/**
 * Bloquear habitación con fechas y motivo
 * @param {number} id - ID de la habitación
 * @param {Object} payload - { desde, hasta, motivo?, tipo? }
 * @returns {Promise<Object>}
 */
export const bloquearHabitacion = async (id, payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/habitaciones/${id}/bloquear`, payload);
    console.log(`✅ Habitación ${id} bloqueada desde ${payload.desde} hasta ${payload.hasta}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al bloquear habitación:', error);
    if (error.response?.status === 404) {
      throw new Error('Habitación no encontrada');
    }
    if (error.response?.status === 409) {
      // Conflicto con bloqueos o reservas existentes
      throw new Error(error.response.data.error || 'Conflicto con bloqueos o reservas existentes');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Datos de bloqueo inválidos');
    }
    throw new Error('Error al crear bloqueo de habitación');
  }
};

/**
 * Obtener todos los bloqueos de habitaciones
 * @param {Object} params - Parámetros opcionales { fechaDesde?, fechaHasta? }
 * @returns {Promise<Array>}
 */
export const listBloqueos = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    
    const response = await axios.get(`${API_BASE_URL}/habitaciones/bloqueos?${queryParams}`);
    console.log(`✅ Bloqueos cargados:`, response.data?.length || 0);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error al obtener bloqueos:', error);
    throw new Error('Error al obtener bloqueos de habitaciones');
  }
};

export default {
  listHabitaciones,
  getCategorias,
  getTiposHabitacion,
  getHabitacionesKpis,
  getHabitacionById,
  updateHabitacionEstado,
  bloquearHabitacion,
  listBloqueos,
};
