import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_EMAILS = `${API_BASE_URL}/emails`;

// Configurar axios con token de autenticación (si lo tienes)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  } : {
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

// 📬 Listar emails con filtros
export const listarEmails = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.estado && filtros.estado !== 'Todos') {
      params.append('estado', mapEstado(filtros.estado));
    }
    if (filtros.prioridad && filtros.prioridad !== 'Todos') {
      params.append('prioridad', filtros.prioridad);
    }
    if (filtros.canal && filtros.canal !== 'Todos') {
      params.append('canal', filtros.canal);
    }
    if (filtros.texto) {
      params.append('texto', filtros.texto);
    }
    if (filtros.fechaDesde) {
      params.append('fechaDesde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      params.append('fechaHasta', filtros.fechaHasta);
    }
    
    // Paginación
    params.append('page', filtros.page || 1);
    params.append('limit', filtros.limit || 100);

    const response = await axios.get(
      `${API_EMAILS}?${params.toString()}`,
      getAuthHeaders()
    );

    return {
      success: true,
      emails: transformEmails(response.data.data),
      pagination: response.data.pagination,
      estadisticas: response.data.estadisticas
    };

  } catch (error) {
    console.error('Error listando emails:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al cargar emails',
      emails: []
    };
  }
};

// 📄 Obtener detalle de email
export const obtenerEmail = async (id) => {
  try {
    const response = await axios.get(
      `${API_EMAILS}/${id}`,
      getAuthHeaders()
    );

    return {
      success: true,
      email: transformEmail(response.data.data)
    };

  } catch (error) {
    console.error('Error obteniendo email:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al cargar email'
    };
  }
};

// ✏️ Actualizar estado/prioridad
export const actualizarEmail = async (id, datos) => {
  try {
    const payload = {};
    
    if (datos.estado) {
      payload.estado = mapEstado(datos.estado);
    }
    if (datos.prioridad) {
      payload.prioridad = datos.prioridad;
    }
    if (datos.operadorId) {
      payload.operadorId = datos.operadorId;
    }

    const response = await axios.patch(
      `${API_EMAILS}/${id}`,
      payload,
      getAuthHeaders()
    );

    return {
      success: true,
      email: transformEmail(response.data.data)
    };

  } catch (error) {
    console.error('Error actualizando email:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al actualizar email'
    };
  }
};

// 📤 Enviar respuesta
export const responderEmail = async (id, respuesta) => {
  try {
    const payload = {
      asunto: respuesta.asunto,
      cuerpoTexto: respuesta.cuerpoTexto,
      cuerpoHtml: respuesta.cuerpoHtml
    };
    
    // Solo incluir operadorId si existe
    if (respuesta.operadorId) {
      payload.operadorId = respuesta.operadorId;
    }

    const response = await axios.post(
      `${API_EMAILS}/${id}/responder`,
      payload,
      getAuthHeaders()
    );

    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.error('Error enviando respuesta:', error);
    
    // Extraer solo el mensaje relevante del error
    let errorMsg = error.response?.data?.error || 'Error al enviar respuesta';
    
    // Si el error contiene "Foreign key constraint", extraer solo esa parte
    if (errorMsg.includes('Foreign key constraint')) {
      const match = errorMsg.match(/Foreign key constraint violated on the constraint: `(.+?)`/);
      if (match) {
        errorMsg = `Error: Restricción de clave foránea violada (${match[1]})`;
      }
    }
    
    // Limitar longitud del mensaje
    if (errorMsg.length > 150) {
      errorMsg = errorMsg.substring(0, 150) + '...';
    }
    
    return {
      success: false,
      error: errorMsg
    };
  }
};

// 🔄 Forzar sincronización
export const sincronizarEmails = async () => {
  try {
    const response = await axios.post(
      `${API_EMAILS}/sync`,
      {},
      getAuthHeaders()
    );

    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.error('Error sincronizando:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al sincronizar'
    };
  }
};

// 📊 Calcular estadísticas (desde los datos)
export const calcularEstadisticas = (emails) => {
  const total = emails.length;
  const pendientes = emails.filter(e => e.estado === 'Pendiente').length;
  const respondidos = emails.filter(e => e.estado === 'Respondido').length;
  
  const ahora = new Date();
  const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
  const ultimas24h = emails.filter(e => new Date(e.fecha) >= hace24h).length;
  
  const porCanal = {
    Web: emails.filter(e => e.canal === 'Web').length,
    Email: emails.filter(e => e.canal === 'Email').length,
    WhatsApp: emails.filter(e => e.canal === 'WhatsApp').length
  };
  
  const porPrioridad = {
    Alta: emails.filter(e => e.prioridad === 'Alta').length,
    Media: emails.filter(e => e.prioridad === 'Media').length,
    Baja: emails.filter(e => e.prioridad === 'Baja').length
  };
  
  return {
    total,
    pendientes,
    respondidos,
    ultimas24h,
    porCanal,
    porPrioridad
  };
};

// 🔄 Transformar datos de backend a formato frontend
function transformEmail(emailBackend) {
  return {
    id: emailBackend.id,
    asunto: emailBackend.asunto,
    remitente: emailBackend.deNombre || emailBackend.deEmail,
    email: emailBackend.deEmail,
    canal: emailBackend.canal,
    prioridad: emailBackend.prioridad,
    fecha: emailBackend.fechaRecibido,
    estado: mapEstadoReverse(emailBackend.estado),
    contenido: emailBackend.cuerpoTexto || '',
    cuerpoHtml: emailBackend.cuerpoHtml,
    respuestas: emailBackend.respuestas?.map(r => ({
      id: r.id,
      asunto: r.asunto,
      contenido: r.cuerpoTexto,
      cuerpoHtml: r.cuerpoHtml,
      fecha: r.fechaEnviado,
      operador: r.operador
    })) || [],
    adjuntos: emailBackend.adjuntos || [],
    operador: emailBackend.operador,
    tieneAdjuntos: emailBackend.tieneAdjuntos
  };
}

function transformEmails(emailsBackend) {
  return emailsBackend.map(transformEmail);
}

// Mapear estados entre frontend y backend
function mapEstado(estadoFrontend) {
  const map = {
    'Pendiente': 'NoLeido',
    'Respondido': 'Respondido',
    'Archivado': 'Archivado',
    'Leido': 'Leido'
  };
  return map[estadoFrontend] || estadoFrontend;
}

function mapEstadoReverse(estadoBackend) {
  const map = {
    'NoLeido': 'Pendiente',
    'Leido': 'Pendiente',
    'Respondido': 'Respondido',
    'Archivado': 'Archivado',
    'Spam': 'Archivado'
  };
  return map[estadoBackend] || estadoBackend;
}

export default {
  listarEmails,
  obtenerEmail,
  actualizarEmail,
  responderEmail,
  sincronizarEmails,
  calcularEstadisticas
};
