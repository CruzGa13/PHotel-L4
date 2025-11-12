import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Card from "../../components/Reserva/Card/Card.jsx";
import FiltroReserva from "../../components/Reserva/FiltroReserva/FiltroReserva.jsx";
import TablaReserva from "../../components/Reserva/TablaReserva/TablaReserva.jsx";
import DetalleReserva from "../../components/Reserva/DetalleReserva/DetalleReserva.jsx";
import { fetchReservas, fetchEstadosReserva, fetchTiposHabitacion } from "../../features/reservas/reservas.service.js";
import "./ReservaOp.css";

export default function ReservaOp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Estados para datos de la API
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservaDetalle, setReservaDetalle] = useState(null);

  // Estados para opciones de filtros (desde la BD)
  const [todosEstados, setTodosEstados] = useState([]);
  const [opcionesTipos, setOpcionesTipos] = useState([]);

  // Estados para filtros y paginación
  const [filtros, setFiltros] = useState({
    q: '',
    estado: 'Todos',
    tipoHabitacion: 'Todos',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  // Cargar estados del enum al montar
  useEffect(() => {
    const loadEstados = async () => {
      try {
        const data = await fetchEstadosReserva();
        setTodosEstados(data.estados || []);
      } catch (err) {
        console.warn('[ReservaOp] No se pudieron cargar estados:', err.message);
        // Fallback manual
        setTodosEstados(['Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada']);
      }
    };
    loadEstados();
  }, []);

  // Cargar tipos de habitación al montar
  useEffect(() => {
    const loadTipos = async () => {
      try {
        const data = await fetchTiposHabitacion();
        setOpcionesTipos(data.tiposHabitacion || []);
      } catch (err) {
        console.warn('[ReservaOp] No se pudieron cargar tipos:', err.message);
      }
    };
    loadTipos();
  }, []);

  // Cargar reservas desde la API
  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchReservas({
        q: filtros.q,
        estado: filtros.estado,
        tipoHabitacion: filtros.tipoHabitacion,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        page,
        pageSize,
        sortBy: 'checkIn',
        sortDir: 'desc'
      });

      setRows(response.rows || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.warn('[ReservaOp] Fallo API reservas:', err.message);
      setError('No se pudieron cargar las reservas. Intente nuevamente.');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambien filtros o página
  useEffect(() => {
    loadReservas();
  }, [filtros, page]);

  // 💳 Manejar retorno desde Stripe Checkout
  useEffect(() => {
    const session_id = searchParams.get('session_id');
    const reservaId = searchParams.get('reservaId');

    if (session_id && reservaId) {
      console.log('[ReservaOp] Retorno desde Stripe detectado:', { session_id, reservaId });

      const confirmarPago = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/pagos/confirmacion`,
            {
              params: { session_id, reservaId }
            }
          );

          console.log('[ReservaOp] Respuesta de confirmación:', response.data);

          if (response.data.ok && response.data.payment?.status === 'paid') {
            // ✅ Pago exitoso
            toast.success('✅ ¡Pago procesado exitosamente! Factura generada.', {
              position: 'top-right',
              autoClose: 5000,
            });

            // Refrescar lista de reservas
            await loadReservas();

            // Abrir factura automáticamente en nueva pestaña
            setTimeout(() => {
              const facturaUrl = `${API_URL}/facturas/${reservaId}`;
              console.log('[ReservaOp] Abriendo factura:', facturaUrl);
              window.open(facturaUrl, '_blank');
            }, 1000);

            // Limpiar query params de la URL
            setSearchParams({});
          } else {
            // ⚠️ Pago no completado
            toast.warning('⚠️ El pago no fue completado. Intente nuevamente.', {
              position: 'top-right',
              autoClose: 5000,
            });
            setSearchParams({});
          }
        } catch (error) {
          console.error('[ReservaOp] Error al confirmar pago:', error);
          toast.error(
            error.response?.data?.error || 
            '❌ Error al confirmar el pago. Contacte a soporte.',
            {
              position: 'top-right',
              autoClose: 5000,
            }
          );
          setSearchParams({});
        }
      };

      confirmarPago();
    }
  }, [searchParams]);

  // Totales calculados desde los datos filtrados en pantalla
  const totals = useMemo(() => {
    // Contar reservas por estado en el conjunto filtrado
    const checkIn = rows.filter(r => r.estado === 'CheckIn').length;
    const checkOut = rows.filter(r => r.estado === 'CheckOut').length;
    
    // Total de reservas mostradas (después de aplicar filtros)
    const totalReservas = rows.length;
    
    // Total monetario de las reservas filtradas
    const totalMonetario = rows.reduce((sum, r) => sum + (r.totalNumerico || 0), 0);

    return {
      totalReservas,
      checkIn,
      checkOut,
      totalMonetario
    };
  }, [rows]);

  // Handler para cambiar cualquier filtro
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPage(1); // Resetear a página 1
  };

  // Handler para limpiar filtros
  const handleClear = () => {
    setFiltros({
      q: '',
      estado: 'Todos',
      tipoHabitacion: 'Todos',
      fechaDesde: '',
      fechaHasta: ''
    });
    setPage(1);
  };

  // 🔁 Actualiza estado en tiempo real cuando el admin cancela una reserva
  const handleUpdateReserva = (updatedReserva) => {
    setRows((prev) =>
      prev.map((r) => (r.id === updatedReserva.id ? updatedReserva : r))
    );
    setReservaDetalle(updatedReserva);
    // TODO: Llamar a patchEstadoReserva para persistir en backend
  };

  return (
    <div className="page">
      <main className="container-main fade-in">
        {/* Breadcrumb */}
        <div className="breadcrumb">
        <div className="breadcrumb breadcrumb-manual"></div>
          <span>Inicio</span>
          <span className="sep">›</span>
          <span className="pink">Reservas</span>
        </div>

        {/* Cabecera */}
        <div className="head-top pt-10">
          <div>
            <h2 className="gradient-text">Reservas</h2>
            <p className="muted">
              Visualización general de reservas confirmadas y canceladas
            </p>
          </div>
        </div>

        {/* Tarjeta resumen */}
        <Card
          totals={{
            totalReservas: totals.totalReservas,
            checkIn: totals.checkIn,
            checkOut: totals.checkOut,
            total: `$${totals.totalMonetario.toLocaleString('es-AR')}`
          }}
        />

        {/* Filtros */}
        <FiltroReserva 
          filtros={filtros}
          opcionesEstado={todosEstados}
          opcionesTipos={opcionesTipos}
          onFiltroChange={handleFiltroChange}
          onClear={handleClear}
        />

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            ⏳ Cargando reservas...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#dc2626',
            background: '#fee2e2',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabla principal */}
        {!loading && !error && (
          <TablaReserva rows={rows} onView={(r) => setReservaDetalle(r)} />
        )}

        {/* Sin resultados */}
        {!loading && !error && rows.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ margin: 0, fontSize: '16px' }}>No se encontraron reservas</p>
          </div>
        )}

        {/* Modal Detalle de Reserva */}
        {reservaDetalle && (
          <DetalleReserva
            reserva={reservaDetalle}
            onClose={() => setReservaDetalle(null)}
            onUpdate={handleUpdateReserva}
            refetchReservas={loadReservas}
          />
        )}
      </main>
    </div>
  );
}