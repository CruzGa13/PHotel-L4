import { useState } from "react";
import "./CancelarReserva.css";

export default function CancelarReserva({ reserva, onClose, onConfirm }) {
  const [view, setView] = useState("confirm");

  const handleCancel = async () => {
    setView("processing");
    try {
      await onConfirm(reserva.id);
      setView("done");
    } catch (err) {
      setView("confirm");
    }
  };

  const renderView = () => {
    if (view === "confirm" || view === "processing") {
      return (
        <>
          <div className="modal-header">
            <h3>Cancelar Reserva</h3>
            <p>
              ¿Deseas cancelar la reserva de{" "}
              <strong>{reserva.huesped}</strong> en{" "}
              <em>{reserva.nombreHabitacion}</em>?
            </p>
          </div>

          <div className="modal-body">
            <p>
              Esta acción cambiará el estado a{" "}
              <strong style={{ color: "#dc2626" }}>Cancelada</strong> y se
              registrará en el historial de movimientos.
            </p>
            <p>No podrás revertir esta acción.</p>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={view === "processing"}
            >
              Cerrar
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={view === "processing"}
            >
              {view === "processing" ? "Procesando..." : "Confirmar Cancelación"}
            </button>
          </div>
        </>
      );
    }

    if (view === "done") {
      return (
        <>
          <div className="success-header">
            <div className="success-icon">🗓️</div>
            <h3>Reserva Cancelada</h3>
            <p>La reserva se actualizó correctamente.</p>
          </div>

          <div className="success-body">
            <p>
              El estado cambió a <strong>Cancelada</strong> y se registró en el
              historial de movimientos.
            </p>
          </div>

          <div className="modal-footer center-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {renderView()}
      </div>
    </div>
  );
}
