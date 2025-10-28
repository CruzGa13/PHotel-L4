import React, { useState } from "react";
import "./DetalleReserva.css";
import { FaTimes } from "react-icons/fa";
import CancelarReserva from "../CancelarReserva/CancelarReserva";
import ConfirmacionCancelacion from "../ConfirmacionCancelacion/ConfirmacionCancelacion";
import { useNavigate } from "react-router-dom";

export default function DetalleReserva({ reserva, onClose, onUpdate }) {
  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();

  if (!reserva) return null;

  // ✅ Cuando se confirma la cancelación
  const handleConfirmCancel = async (id) => {
    const updatedReserva = {
      ...reserva,
      estado: "Cancelada",
      historial: [
        ...reserva.historial,
        {
          accion: "Cancelación por administrador",
          usuario: "Administrador",
          fecha: new Date().toLocaleDateString(),
          hora: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    onUpdate(updatedReserva);
    setShowCancel(false);
    setShowSuccess(true);
  };

  // ✅ Cuando el mensaje de éxito termina → cerrar modal + redirigir
  const handleSuccessClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose(); // desmonta el modal DetalleReserva
      navigate("/"); // redirige al inicio
    }, 700);
  };

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
                  reserva.estado === "Confirmada"
                    ? "estado-verde"
                    : "estado-rojo"
                }`}
              >
                {reserva.estado}
              </span>
            </p>
            
            {reserva.estado === "Confirmada" && (
              <div className="cancel-box">
                <button
                  className="btn-cancelar"
                  onClick={() => setShowCancel(true)}
                >
                  Cancelar Reserva
                </button>
              </div>
            )}

            <div className="historial-box">
              <h4>Historial de Movimientos</h4>
              {reserva.historial && reserva.historial.length > 0 ? (
                <ul>
                  {reserva.historial.map((h, i) => (
                    <li key={i}>
                      <strong>{h.accion}</strong> por <em>{h.usuario}</em> —{" "}
                      {h.fecha} {h.hora}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-movimientos">Sin registros aún.</p>
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
