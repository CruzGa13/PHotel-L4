import React, { useState, useEffect } from "react";
import "./DetalleReserva.css";
import { FaTimes } from "react-icons/fa";
import CancelarReserva from "../CancelarReserva/CancelarReserva";
import ConfirmacionCancelacion from "../ConfirmacionCancelacion/ConfirmacionCancelacion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchHistorialReserva } from "../../../features/reservas/reservas.service.js";

export default function DetalleReserva({ reserva, onClose, onUpdate, refetchReservas }) {
  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);
  const [reservaActual, setReservaActual] = useState(reserva);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  if (!reserva) return null;

  // Cargar historial desde la base de datos al abrir el modal
  useEffect(() => {
    const loadHistorial = async () => {
      if (!reserva?.id) return;
      
      try {
        setLoadingHistorial(true);
        const data = await fetchHistorialReserva(reserva.id);
        setHistorial(data.historial || []);
      } catch (error) {
        console.warn('[DetalleReserva] Error al cargar historial:', error);
        // Si falla, usar historial del objeto reserva (fallback)
        setHistorial(reserva.historial || []);
      } finally {
        setLoadingHistorial(false);
      }
    };

    loadHistorial();
  }, [reserva?.id]);

  // Sincronizar reservaActual con prop reserva
  useEffect(() => {
    setReservaActual(reserva);
  }, [reserva]);

  // 🔄 Refetch del detalle de la reserva (para obtener factura actualizada)
  const refetchDetalleReserva = async () => {
    try {
      console.log('[DetalleReserva] Refrescando detalle de reserva:', reserva.id);
      const response = await axios.get(`${API_URL}/reservas/${reserva.id}`);
      
      if (response.data) {
        console.log('[DetalleReserva] Reserva actualizada:', response.data);
        setReservaActual(response.data);
        
        // Actualizar también en el componente padre si existe onUpdate
        if (onUpdate) {
          onUpdate(response.data);
        }
      }
    } catch (error) {
      console.warn('[DetalleReserva] Error al refrescar detalle:', error);
    }
  };

  // 🔄 Cargar detalle completo al montar (incluye factura)
  useEffect(() => {
    const loadDetalleCompleto = async () => {
      if (!reserva?.id) return;
      
      console.log('[DetalleReserva] Cargando detalle completo con factura...');
      await refetchDetalleReserva();
    };
    
    loadDetalleCompleto();
  }, [reserva?.id]);

  // ✅ Cuando se confirma la cancelación desde el modal
  const handleConfirmCancel = async (id) => {
    setShowCancel(false);
    await handleCambiarEstado("Cancelada", "Cancelación por administrador");
  };

  // ✅ Cuando el mensaje de éxito termina → cerrar modal + redirigir
  const handleSuccessClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose(); // desmonta el modal DetalleReserva
      navigate("/"); // redirige al inicio
    }, 700);
  };

  // 🔄 Función genérica para cambiar estado de reserva
  const handleCambiarEstado = async (nuevoEstado, mensajeAccion) => {
    if (loading) return;

    try {
      setLoading(true);

      // Llamada PATCH al backend
      const response = await axios.patch(
        `${API_URL}/reservas/${reserva.id}/estado`,
        { estado: nuevoEstado },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Refrescar detalle de la reserva (incluye factura actualizada)
        await refetchDetalleReserva();
        
        // Refrescar lista de reservas en la tabla
        if (refetchReservas) {
          await refetchReservas();
        }

        // Recargar historial desde la BD
        try {
          const historialData = await fetchHistorialReserva(reserva.id);
          setHistorial(historialData.historial || []);
        } catch (error) {
          console.warn('[handleCambiarEstado] Error al recargar historial:', error);
        }

        // Mostrar toast de éxito
        toast.success(`✅ Reserva actualizada a ${nuevoEstado}`, {
          position: "top-right",
          autoClose: 3000,
        });

        // NO cerrar el modal - mantenerlo abierto para ver los cambios
        // El usuario puede cerrarlo manualmente
        console.log('[handleCambiarEstado] Reserva actualizada correctamente');
      }
    } catch (error) {
      console.error(`Error al cambiar estado a ${nuevoEstado}:`, error);
      
      // Manejo específico para validación de pago (409 con requierePago)
      if (error.response?.status === 409 && error.response?.data?.requierePago) {
        toast.warning(
          '⚠️ ' + (error.response.data.message || 'Debe procesar el pago antes de confirmar la reserva.'),
          {
            position: "top-right",
            autoClose: 6000,
          }
        );
        
        // Refrescar detalle de reserva para actualizar estado
        await refetchDetalleReserva();
      } else {
        // Error genérico
        toast.error(
          `❌ ${error.response?.data?.message || error.response?.data?.error || error.message}`,
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers específicos
  const handleConfirmar = () => {
    handleCambiarEstado("Confirmada", "Reserva confirmada por administrador");
  };

  const handleCheckIn = () => {
    handleCambiarEstado("CheckIn", "Check-In realizado");
  };

  const handleCheckOut = () => {
    handleCambiarEstado("CheckOut", "Check-Out realizado");
  };

  const handleCancelar = () => {
    setShowCancel(true);
  };

  // 💳 Crear sesión de Stripe y redirigir
  const handleCobrarConStripe = async () => {
    try {
      setLoadingPago(true);
      console.log('[DetalleReserva] Creando sesión de Stripe para reserva:', reserva.id);

      const response = await axios.post(
        `${API_URL}/pagos/checkout-session`,
        { reservaId: reserva.id },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.url) {
        console.log('[DetalleReserva] Redirigiendo a Stripe:', response.data.url);
        // Redirigir a Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error) {
      console.error('[DetalleReserva] Error al crear sesión de pago:', error);
      
      // Manejo específico para factura ya pagada (409)
      if (error.response?.status === 409) {
        toast.warning(
          '⚠️ ' + (error.response?.data?.message || 'Esta reserva ya tiene una factura pagada.'),
          { autoClose: 6000 }
        );
        
        // Refrescar detalle de reserva para actualizar estado
        await refetchDetalleReserva();
      } else {
        // Error genérico
        toast.error(
          error.response?.data?.message || 
          error.response?.data?.error || 
          'Error al crear sesión de pago. Intente nuevamente.'
        );
      }
      
      setLoadingPago(false);
    }
  };

  // 📄 Descargar factura en nueva pestaña
  const handleDescargarFactura = () => {
    const facturaUrl = `${API_URL}/facturas/${reserva.id}`;
    console.log('[DetalleReserva] Abriendo factura:', facturaUrl);
    window.open(facturaUrl, '_blank');
  };

  // 🚦 Flags de visibilidad y habilitación de botones
  const isFinal = reservaActual.estado === "Cancelada" || reservaActual.estado === "CheckOut";
  const hasFactura = !!reservaActual.factura;
  const facturaPagada = hasFactura && reservaActual.factura.estado === "Pagada";
  const canPay = !isFinal && !hasFactura; // Solo puede pagar si NO tiene factura
  const canConfirm = !isFinal && facturaPagada; // Solo puede confirmar si hay pago

  console.log('[DetalleReserva] Flags:', {
    isFinal,
    hasFactura,
    facturaPagada,
    canPay,
    canConfirm,
    estado: reservaActual.estado,
    factura: reservaActual.factura
  });

  return (
    <>
      <div
        className={`detalle-overlay ${closing ? "fade-out" : ""}`}
        onClick={onClose}
      >
        <div
          className={`detalle-modal ${closing ? "closing" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="detalle-header">
            <h3>Detalle de Reserva</h3>
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div className="detalle-content">
            <p>
              <strong>N° de Habitación:</strong> {reserva.numeroHabitacion}
            </p>
            <p>
              <strong>Huésped:</strong> {reserva.huesped}
            </p>
            <p>
              <strong>Habitación:</strong> {reserva.nombreHabitacion}
            </p>
            <p>
              <strong>Check-in:</strong> {reserva.checkIn}
            </p>
            <p>
              <strong>Check-out:</strong> {reserva.checkOut}
            </p>
            <p>
              <strong>Total:</strong> {reserva.total}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={`estado-tag ${
                  reserva.estado === "Pendiente"
                    ? "estado-amarillo"
                    : reserva.estado === "Confirmada"
                    ? "estado-verde"
                    : reserva.estado === "CheckIn"
                    ? "estado-azul"
                    : reserva.estado === "CheckOut"
                    ? "estado-purpura"
                    : "estado-rojo"
                }`}
              >
                {reserva.estado}
              </span>
            </p>
            
            {/* 🔘 BOTONES CONDICIONALES SEGÚN ESTADO */}
            <div className="estado-actions">
              {reservaActual.estado === "Pendiente" && (
                <>
                  <button
                    className="btn-confirmar"
                    onClick={handleConfirmar}
                    disabled={loading || !canConfirm}
                    title={!canConfirm ? "Debe procesar el pago antes de confirmar" : ""}
                  >
                    {loading ? "Procesando..." : "✅ Confirmar"}
                  </button>
                  <button
                    className="btn-cancelar"
                    onClick={handleCancelar}
                    disabled={loading}
                  >
                    ❌ Cancelar
                  </button>
                  
                  {/* Hint cuando no puede confirmar */}
                  {!canConfirm && (
                    <p className="estado-hint">
                      💡 Para confirmar la reserva, primero procesá el pago con Stripe.
                    </p>
                  )}
                </>
              )}

              {reservaActual.estado === "Confirmada" && (
                <>
                  <button
                    className="btn-checkin"
                    onClick={handleCheckIn}
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : "🚪 Check-In"}
                  </button>
                  <button
                    className="btn-cancelar"
                    onClick={handleCancelar}
                    disabled={loading}
                  >
                    ❌ Cancelar
                  </button>
                </>
              )}

              {reservaActual.estado === "CheckIn" && (
                <button
                  className="btn-checkout"
                  onClick={handleCheckOut}
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "🏁 Check-Out"}
                </button>
              )}

              {(reservaActual.estado === "CheckOut" || reservaActual.estado === "Cancelada") && (
                <p className="estado-final-msg">
                  ℹ️ Esta reserva está en estado final. No se pueden realizar más cambios.
                </p>
              )}
            </div>

            {/* 💳 SECCIÓN PAGO / FACTURA */}
            <div className="pago-factura-box">
              <h4>💳 Pago y Facturación</h4>
              
              {/* Badge de Factura Pagada */}
              {facturaPagada && (
                <div className="badge-factura-pagada">
                  ✅ Factura Pagada
                </div>
              )}

              {/* Botón de pago solo si canPay === true */}
              {canPay && (
                <button
                  className="btn-stripe-pago"
                  onClick={handleCobrarConStripe}
                  disabled={loadingPago}
                >
                  {loadingPago ? "⏳ Creando sesión..." : "💳 Cobrar con Stripe"}
                </button>
              )}

              {/* Botón de descarga de factura solo si existe factura */}
              {hasFactura && (
                <button
                  className="btn-descargar-factura"
                  onClick={handleDescargarFactura}
                >
                  📄 Descargar Factura
                </button>
              )}

              {/* Mensajes informativos */}
              {facturaPagada ? (
                <p className="pago-info">
                  ✅ El pago de esta reserva ya fue procesado. Puede descargar la factura.
                </p>
              ) : hasFactura ? (
                <p className="pago-info">
                  ⏳ Factura generada. Esperando confirmación de pago.
                </p>
              ) : isFinal ? (
                <p className="pago-info">
                  ℹ️ Reserva finalizada sin factura asociada.
                </p>
              ) : (
                <p className="pago-info">
                  💡 Use "Cobrar con Stripe" para procesar el pago de forma segura.
                </p>
              )}
            </div>

            <div className="historial-box">
              <h4>Historial de Movimientos</h4>
              {loadingHistorial ? (
                <p className="no-movimientos">⏳ Cargando historial...</p>
              ) : historial && historial.length > 0 ? (
                <ul>
                  {historial.map((h, i) => (
                    <li key={h.id || i}>
                      <strong>{h.accion}</strong> por <em>{h.operador}</em> —{" "}
                      {h.fecha} {h.hora}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-movimientos">Sin registros de cambios de estado aún.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CANCELAR */}
      {showCancel && (
        <CancelarReserva
          reserva={reserva}
          onClose={() => setShowCancel(false)}
          onConfirm={handleConfirmCancel}
        />
      )}

      {/* MENSAJE DE ÉXITO */}
      {showSuccess && (
        <ConfirmacionCancelacion onClose={handleSuccessClose} />
      )}
    </>
  );
}