/**
 * Servicio para gestión de reservas (Operador)
 * Conecta con la API backend para leer y actualizar reservas
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene TODOS los estados del enum EstadoReserva
 * @returns {Promise<{estados: string[]}>}
 */
export async function fetchEstadosReserva() {
  try {
    const url = `${API_URL}/reservas/estados`;
    console.log('[fetchEstadosReserva] Llamando a:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[fetchEstadosReserva] Respuesta:', data);

    return data;
  } catch (error) {
    console.error('[fetchEstadosReserva] Error:', error);
    throw error;
  }
}

/**
 * Obtiene tipos de habitación para filtros
 * @returns {Promise<{tiposHabitacion: string[]}>}
 */
export async function fetchTiposHabitacion() {
  try {
    const url = `${API_URL}/reservas/filters`;
    console.log('[fetchTiposHabitacion] Llamando a:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[fetchTiposHabitacion] Respuesta:', data);

    return data;
  } catch (error) {
    console.error('[fetchTiposHabitacion] Error:', error);
    throw error;
  }
}

/**
 * Obtiene lista de reservas con filtros y paginación
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.q - Búsqueda general
 * @param {string} params.estado - Filtro por estado
 * @param {string} params.tipoHabitacion - Filtro por tipo de habitación
 * @param {string} params.fechaDesde - Fecha desde (YYYY-MM-DD)
 * @param {string} params.fechaHasta - Fecha hasta (YYYY-MM-DD)
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.pageSize - Items por página (default: 10)
 * @param {string} params.sortBy - Campo para ordenar
 * @param {string} params.sortDir - Dirección asc|desc
 * @returns {Promise<ReservasResponse>}
 */
export async function fetchReservas({
  q = '',
  estado = '',
  tipoHabitacion = '',
  fechaDesde = '',
  fechaHasta = '',
  page = 1,
  pageSize = 50,
  sortBy = 'checkIn',
  sortDir = 'desc'
} = {}) {
  try {
    const params = new URLSearchParams();
    
    // Solo agregar params con valores reales (no vacíos ni 'Todos')
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    
    if (q && q.trim()) params.append('q', q.trim());
    if (estado && estado.trim() && estado !== 'Todos') params.append('estado', estado.trim());
    if (tipoHabitacion && tipoHabitacion.trim() && tipoHabitacion !== 'Todos') params.append('tipoHabitacion', tipoHabitacion.trim());
    if (fechaDesde && fechaDesde.trim()) params.append('fechaDesde', fechaDesde.trim());
    if (fechaHasta && fechaHasta.trim()) params.append('fechaHasta', fechaHasta.trim());

    const url = `${API_URL}/reservas?${params.toString()}`;
    console.log('[fetchReservas] Llamando a:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[fetchReservas] Respuesta:', data);

    return data;
  } catch (error) {
    console.error('[fetchReservas] Error:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de una reserva
 * @param {number|string} id - ID de la reserva
 * @param {string} estado - Nuevo estado
 * @returns {Promise<Object>}
 */
export async function patchEstadoReserva(id, estado) {
  try {
    const url = `${API_URL}/reservas/${id}/estado`;
    console.log('[patchEstadoReserva] Actualizando:', { id, estado });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[patchEstadoReserva] Respuesta:', data);

    return data;
  } catch (error) {
    console.error('[patchEstadoReserva] Error:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de movimientos de una reserva
 * @param {number|string} id - ID de la reserva
 * @returns {Promise<Object>}
 */
export async function fetchHistorialReserva(id) {
  try {
    const url = `${API_URL}/reservas/${id}/historial`;
    console.log('[fetchHistorialReserva] Llamando a:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[fetchHistorialReserva] Respuesta:', data);

    return data;
  } catch (error) {
    console.error('[fetchHistorialReserva] Error:', error);
    throw error;
  }
}

/**
 * Tipos TypeScript para referencia (comentados para JS)
 * 
 * @typedef {Object} ReservaRow
 * @property {number} id
 * @property {string} codigo
 * @property {string} huesped
 * @property {string} email
 * @property {string} tipoHabitacion
 * @property {string} habitacion
 * @property {string} checkIn - ISO date string
 * @property {string} checkOut - ISO date string
 * @property {number} total
 * @property {string} estado
 * @property {number} adultos
 * @property {number} ninios
 * @property {number} totalHabitaciones
 * @property {string|null} observaciones
 * 
 * @typedef {Object} ReservasResponse
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {ReservaRow[]} rows
 */
