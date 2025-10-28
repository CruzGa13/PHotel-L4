import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConfirmacionCancelacion.css";

export default function ConfirmacionCancelacion({ onClose }) {
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true); // activa la animación de salida
      setTimeout(() => {
        onClose();
        navigate("/"); // redirección suave al inicio
      }, 800); // tiempo para el fade-out
    }, 2000); // muestra 2 segundos antes de cerrar

    return () => clearTimeout(timer);
  }, [navigate, onClose]);

  return (
    <div
      className={`confirm-overlay ${closing ? "fade-out" : ""}`}
      onClick={onClose}
    >
      <div
        className={`confirm-content ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header">
          <span className="emoji"></span>
          <h3>Reserva Cancelada</h3>
          <p>La reserva fue actualizada correctamente.</p>
        </div>
        <div className="confirm-body">
          <p>
            El estado cambió a <strong>Cancelada</strong> y se registró en el
            historial de movimientos.
          </p>
        </div>
      </div>
    </div>
  );
}
