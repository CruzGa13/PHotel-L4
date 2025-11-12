// ================================================================
// 📝 EJEMPLOS PRÁCTICOS DE USO DESDE EL FRONTEND
// Sistema de Cambio de Estado con Historial Persistente
// ================================================================

import axios from 'axios';
import { toast } from 'react-toastify';
import { fetchHistorialReserva } from '../features/reservas/reservas.service.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ================================================================
// EJEMPLO 1: Cambiar Estado Simple (sin operador)
// ================================================================

/**
 * Cambia el estado de una reserva sin especificar operador
 * El operadorId se guardará como null en la BD
 */
const cambiarEstadoSimple = async (reservaId, nuevoEstado) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/reservas/${reservaId}/estado`,
      { estado: nuevoEstado }
    );

    if (response.data.success) {
      console.log('✅ Estado actualizado:', response.data);
      toast.success(`Reserva actualizada a ${nuevoEstado}`);
      return response.data;
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message);
    toast.error(error.response?.data?.message || 'Error al actualizar');
    throw error;
  }
};

// USO:
// await cambiarEstadoSimple(123, 'Confirmada');


// ================================================================
// EJEMPLO 2: Cambiar Estado con Operador
// ================================================================

/**
 * Cambia el estado especificando quién hace el cambio
 * Útil para auditoría y seguimiento
 */
const cambiarEstadoConOperador = async (reservaId, nuevoEstado, operadorEmail) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/reservas/${reservaId}/estado`,
      {
        estado: nuevoEstado,
        operadorId: operadorEmail
      }
    );

    if (response.data.success) {
      console.log('✅ Cambio registrado por:', operadorEmail);
      toast.success(`Reserva actualizada a ${nuevoEstado} por ${operadorEmail}`);
      return response.data;
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data);
    toast.error(error.response?.data?.message || 'Error al actualizar');
    throw error;
  }
};

// USO:
// await cambiarEstadoConOperador(123, 'CheckIn', 'admin@hotel.com');


// ================================================================
// EJEMPLO 3: Flujo Completo con Historial
// ================================================================

/**
 * Cambia el estado y obtiene el historial actualizado
 * Retorna tanto los datos de la reserva como el historial
 */
const cambiarEstadoYObtenerHistorial = async (reservaId, nuevoEstado, operadorId = null) => {
  try {
    // 1. Cambiar estado
    const responseEstado = await axios.patch(
      `${API_URL}/api/reservas/${reservaId}/estado`,
      { estado: nuevoEstado, operadorId }
    );

    if (responseEstado.data.success) {
      // 2. Obtener historial actualizado
      const historialData = await fetchHistorialReserva(reservaId);

      // 3. Mostrar notificación
      toast.success(`✅ Reserva actualizada a ${nuevoEstado}`);

      // 4. Retornar todo
      return {
        reserva: responseEstado.data.reserva,
        movimiento: responseEstado.data.movimiento,
        historial: historialData.historial,
        totalMovimientos: historialData.totalMovimientos
      };
    }
  } catch (error) {
    console.error('❌ Error en flujo completo:', error);
    toast.error(error.response?.data?.message || 'Error al actualizar');
    throw error;
  }
};

// USO:
// const resultado = await cambiarEstadoYObtenerHistorial(123, 'CheckOut', 'recepcion@hotel.com');
// console.log('Historial completo:', resultado.historial);


// ================================================================
// EJEMPLO 4: Hook Personalizado para Cambio de Estado
// ================================================================

import { useState } from 'react';

/**
 * Hook personalizado para manejar cambios de estado
 * Incluye loading, error handling y actualización de historial
 */
const useEstadoReserva = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cambiarEstado = async (reservaId, nuevoEstado, operadorId = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(
        `${API_URL}/api/reservas/${reservaId}/estado`,
        { estado: nuevoEstado, operadorId }
      );

      if (response.data.success) {
        toast.success(`✅ Estado cambiado a ${nuevoEstado}`);
        return response.data;
      }
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al cambiar estado';
      setError(mensaje);
      toast.error(`❌ ${mensaje}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const obtenerHistorial = async (reservaId) => {
    try {
      const data = await fetchHistorialReserva(reservaId);
      return data.historial;
    } catch (err) {
      console.error('Error al obtener historial:', err);
      return [];
    }
  };

  return {
    cambiarEstado,
    obtenerHistorial,
    loading,
    error
  };
};

// USO EN COMPONENTE:
/*
function ReservaDetail({ reserva }) {
  const { cambiarEstado, obtenerHistorial, loading, error } = useEstadoReserva();
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const cargarHistorial = async () => {
      const hist = await obtenerHistorial(reserva.id);
      setHistorial(hist);
    };
    cargarHistorial();
  }, [reserva.id]);

  const handleConfirmar = async () => {
    await cambiarEstado(reserva.id, 'Confirmada', 'admin@hotel.com');
    const nuevoHistorial = await obtenerHistorial(reserva.id);
    setHistorial(nuevoHistorial);
  };

  return (
    <div>
      <button onClick={handleConfirmar} disabled={loading}>
        {loading ? 'Confirmando...' : 'Confirmar Reserva'}
      </button>
      {error && <p className="error">{error}</p>}
      
      <ul>
        {historial.map(h => (
          <li key={h.id}>
            {h.accion} - {h.fecha} {h.hora}
          </li>
        ))}
      </ul>
    </div>
  );
}
*/


// ================================================================
// EJEMPLO 5: Componente de Botones de Estado Reutilizable
// ================================================================

import React from 'react';

/**
 * Componente que renderiza botones según el estado actual
 * Completamente reutilizable
 */
const BotonesEstadoReserva = ({ 
  reserva, 
  onEstadoCambiado, 
  operadorId = null 
}) => {
  const [loading, setLoading] = useState(false);

  const handleCambio = async (nuevoEstado) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/api/reservas/${reserva.id}/estado`,
        { estado: nuevoEstado, operadorId }
      );

      if (response.data.success) {
        toast.success(`✅ Estado actualizado a ${nuevoEstado}`);
        
        // Callback para que el componente padre actualice
        if (onEstadoCambiado) {
          onEstadoCambiado(response.data.reserva);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Renderizado condicional según estado
  if (reserva.estado === 'Pendiente') {
    return (
      <div className="botones-estado">
        <button 
          onClick={() => handleCambio('Confirmada')}
          disabled={loading}
          className="btn-confirmar"
        >
          {loading ? 'Procesando...' : '✅ Confirmar'}
        </button>
        <button 
          onClick={() => handleCambio('Cancelada')}
          disabled={loading}
          className="btn-cancelar"
        >
          ❌ Cancelar
        </button>
      </div>
    );
  }

  if (reserva.estado === 'Confirmada') {
    return (
      <div className="botones-estado">
        <button 
          onClick={() => handleCambio('CheckIn')}
          disabled={loading}
          className="btn-checkin"
        >
          {loading ? 'Procesando...' : '🚪 Check-In'}
        </button>
        <button 
          onClick={() => handleCambio('Cancelada')}
          disabled={loading}
          className="btn-cancelar"
        >
          ❌ Cancelar
        </button>
      </div>
    );
  }

  if (reserva.estado === 'CheckIn') {
    return (
      <div className="botones-estado">
        <button 
          onClick={() => handleCambio('CheckOut')}
          disabled={loading}
          className="btn-checkout"
        >
          {loading ? 'Procesando...' : '🏁 Check-Out'}
        </button>
      </div>
    );
  }

  // Estados finales
  return (
    <p className="estado-final">
      ℹ️ Esta reserva está en estado final: {reserva.estado}
    </p>
  );
};

// USO:
/*
<BotonesEstadoReserva 
  reserva={reservaActual}
  onEstadoCambiado={(reservaActualizada) => {
    console.log('Reserva actualizada:', reservaActualizada);
    refetchReservas();
  }}
  operadorId="admin@hotel.com"
/>
*/


// ================================================================
// EJEMPLO 6: Componente de Historial Reutilizable
// ================================================================

/**
 * Componente para mostrar historial de cualquier reserva
 * Se actualiza automáticamente
 */
const HistorialReserva = ({ reservaId }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarHistorial = async () => {
      setLoading(true);
      try {
        const data = await fetchHistorialReserva(reservaId);
        setHistorial(data.historial || []);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setHistorial([]);
      } finally {
        setLoading(false);
      }
    };

    if (reservaId) {
      cargarHistorial();
    }
  }, [reservaId]);

  if (loading) {
    return <p>⏳ Cargando historial...</p>;
  }

  if (historial.length === 0) {
    return <p>Sin movimientos registrados</p>;
  }

  return (
    <div className="historial-container">
      <h4>Historial de Cambios ({historial.length})</h4>
      <ul className="historial-lista">
        {historial.map((mov) => (
          <li key={mov.id} className="historial-item">
            <div className="historial-accion">
              <strong>{mov.accion}</strong>
            </div>
            <div className="historial-meta">
              <span>Por: {mov.operador}</span>
              <span>{mov.fecha} {mov.hora}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// USO:
// <HistorialReserva reservaId={123} />


// ================================================================
// EJEMPLO 7: Manejo de Errores Específicos
// ================================================================

/**
 * Función con manejo detallado de diferentes tipos de errores
 */
const cambiarEstadoConManejoDeErrores = async (reservaId, nuevoEstado, operadorId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/reservas/${reservaId}/estado`,
      { estado: nuevoEstado, operadorId }
    );

    return response.data;

  } catch (error) {
    // Error específico de transición no permitida
    if (error.response?.data?.error === 'Transición de estado no permitida') {
      toast.error(`🚫 ${error.response.data.message}`, {
        autoClose: 5000
      });
      throw new Error('TRANSICION_NO_PERMITIDA');
    }

    // Error de reserva no encontrada
    if (error.response?.data?.error === 'Reserva no encontrada') {
      toast.error('❌ La reserva no existe');
      throw new Error('RESERVA_NO_ENCONTRADA');
    }

    // Error de estado duplicado
    if (error.response?.data?.error === 'Estado duplicado') {
      toast.warning('⚠️ La reserva ya está en ese estado');
      throw new Error('ESTADO_DUPLICADO');
    }

    // Error de estado inválido
    if (error.response?.data?.error === 'Estado inválido') {
      toast.error('❌ Estado no válido');
      throw new Error('ESTADO_INVALIDO');
    }

    // Error de red o servidor
    if (!error.response) {
      toast.error('❌ Error de conexión con el servidor');
      throw new Error('ERROR_RED');
    }

    // Error genérico
    toast.error('❌ Error inesperado al cambiar estado');
    throw error;
  }
};

// USO CON TRY-CATCH:
/*
try {
  await cambiarEstadoConManejoDeErrores(123, 'CheckOut', 'admin@hotel.com');
  console.log('✅ Cambio exitoso');
} catch (error) {
  switch (error.message) {
    case 'TRANSICION_NO_PERMITIDA':
      // Mostrar modal con estados permitidos
      break;
    case 'RESERVA_NO_ENCONTRADA':
      // Redirigir a lista de reservas
      break;
    case 'ESTADO_DUPLICADO':
      // Refrescar datos
      break;
    default:
      console.error('Error no manejado:', error);
  }
}
*/


// ================================================================
// EJEMPLO 8: Integración con React Query
// ================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hooks de React Query para manejar estado de reservas
 * Incluye cache automático y sincronización
 */

// Hook para obtener historial con cache
export const useHistorialReserva = (reservaId) => {
  return useQuery({
    queryKey: ['historial', reservaId],
    queryFn: () => fetchHistorialReserva(reservaId),
    enabled: !!reservaId,
    staleTime: 30000, // 30 segundos
  });
};

// Hook para cambiar estado con invalidación de cache
export const useCambiarEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reservaId, estado, operadorId }) => {
      const response = await axios.patch(
        `${API_URL}/api/reservas/${reservaId}/estado`,
        { estado, operadorId }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['historial', variables.reservaId]);
      queryClient.invalidateQueries(['reservas']);
      
      toast.success(`✅ Estado actualizado a ${variables.estado}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  });
};

// USO EN COMPONENTE:
/*
function ReservaCard({ reserva }) {
  const { data: historialData, isLoading } = useHistorialReserva(reserva.id);
  const cambiarEstado = useCambiarEstado();

  const handleConfirmar = () => {
    cambiarEstado.mutate({
      reservaId: reserva.id,
      estado: 'Confirmada',
      operadorId: 'admin@hotel.com'
    });
  };

  return (
    <div>
      <button 
        onClick={handleConfirmar}
        disabled={cambiarEstado.isPending}
      >
        {cambiarEstado.isPending ? 'Confirmando...' : 'Confirmar'}
      </button>

      {isLoading ? (
        <p>Cargando historial...</p>
      ) : (
        <ul>
          {historialData?.historial?.map(h => (
            <li key={h.id}>{h.accion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
*/


// ================================================================
// EJEMPLO 9: Validación de Transiciones en el Frontend
// ================================================================

/**
 * Utilidad para validar si una transición es válida
 * Previene errores antes de llamar al backend
 */
const TRANSICIONES_VALIDAS = {
  'Pendiente': ['Confirmada', 'Cancelada'],
  'Confirmada': ['CheckIn', 'Cancelada'],
  'CheckIn': ['CheckOut'],
  'CheckOut': [],
  'Cancelada': []
};

export const esTransicionValida = (estadoActual, estadoNuevo) => {
  const permitidos = TRANSICIONES_VALIDAS[estadoActual] || [];
  return permitidos.includes(estadoNuevo);
};

export const obtenerEstadosPermitidos = (estadoActual) => {
  return TRANSICIONES_VALIDAS[estadoActual] || [];
};

// USO:
/*
const handleCambiarEstado = (nuevoEstado) => {
  if (!esTransicionValida(reserva.estado, nuevoEstado)) {
    const permitidos = obtenerEstadosPermitidos(reserva.estado);
    toast.warning(
      `No puedes cambiar de ${reserva.estado} a ${nuevoEstado}. ` +
      `Estados permitidos: ${permitidos.join(', ')}`
    );
    return;
  }

  // Proceder con el cambio
  cambiarEstado(reserva.id, nuevoEstado);
};
*/


// ================================================================
// EJEMPLO 10: Timeline Visual del Historial
// ================================================================

/**
 * Componente que muestra el historial como una línea de tiempo
 */
const TimelineHistorial = ({ reservaId }) => {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const data = await fetchHistorialReserva(reservaId);
      setHistorial(data.historial || []);
    };
    cargar();
  }, [reservaId]);

  return (
    <div className="timeline">
      {historial.map((mov, index) => (
        <div key={mov.id} className="timeline-item">
          <div className="timeline-marker" />
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="estado-badge estado-{mov.estadoNuevo.toLowerCase()}">
                {mov.estadoNuevo}
              </span>
              <span className="timeline-fecha">
                {mov.fecha} {mov.hora}
              </span>
            </div>
            <div className="timeline-body">
              <p>{mov.accion}</p>
              <small>Por: {mov.operador}</small>
            </div>
          </div>
          {index < historial.length - 1 && <div className="timeline-line" />}
        </div>
      ))}
    </div>
  );
};

// CSS SUGERIDO:
/*
.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  position: relative;
  padding-left: 40px;
  padding-bottom: 30px;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  border: 3px solid #fff;
  box-shadow: 0 0 0 3px #dbeafe;
}

.timeline-line {
  position: absolute;
  left: 7px;
  top: 16px;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-content {
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}
*/

// ================================================================
// 🎯 RESUMEN DE MEJORES PRÁCTICAS
// ================================================================

/*
1. ✅ Siempre validar transiciones en el frontend antes de llamar al backend
2. ✅ Manejar errores específicos con mensajes claros
3. ✅ Mostrar feedback visual (toasts) al usuario
4. ✅ Recargar historial después de cada cambio exitoso
5. ✅ Usar loading states para mejorar UX
6. ✅ Implementar retry logic para errores de red
7. ✅ Cachear datos de historial cuando sea apropiado
8. ✅ Validar permisos del usuario antes de mostrar botones
9. ✅ Registrar operadorId para auditoría
10. ✅ Usar componentes reutilizables para mantener consistencia
*/

export {
  cambiarEstadoSimple,
  cambiarEstadoConOperador,
  cambiarEstadoYObtenerHistorial,
  useEstadoReserva,
  BotonesEstadoReserva,
  HistorialReserva,
  cambiarEstadoConManejoDeErrores,
  useHistorialReserva,
  useCambiarEstado,
  esTransicionValida,
  obtenerEstadosPermitidos,
  TimelineHistorial
};
