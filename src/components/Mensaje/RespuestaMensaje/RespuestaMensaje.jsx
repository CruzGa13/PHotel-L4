import { useState } from "react";
import "./RespuestaMensaje.css";
export default function RespuestaMensaje({ mensaje, onClose, onSend }) {
  const [respuesta, setRespuesta] = useState("");
  const [view, setView] = useState("form"); // 'form', 'confirm_cancel', 'confirm_send', 'loading'
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (respuesta.trim() === "") {
      setError("No puedes enviar una respuesta vacía.");
      return;
    }
    setError("");
    setView("loading");
    try {
      await onSend(mensaje.id, respuesta);
      setView("confirm_send");
    } catch (err) {
      setError("Hubo un error al enviar el mensaje. Inténtalo de nuevo.");
      setView("form");
    }
  };
  const renderView = () => {
    // Vista 1: Formulario principal para escribir
    if (view === "form" || view === "loading") {
      return (
        <>
          <div className="modal-header">
            <h3>Responder Mensaje</h3>
            <p>
              Respondiendo a: <strong>{mensaje.cliente}</strong> (
              <em>{mensaje.email}</em>)
            </p>
          </div>
          <div className="modal-body">
            <label>Mensaje Original:</label>
            <blockquote className="original-message">
              {mensaje.mensaje}
            </blockquote>

            <label htmlFor="respuesta">Tu Respuesta:</label>
            <textarea
              id="respuesta"
              className="modal-textarea"
              rows="6"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              disabled={view === "loading"}
            ></textarea>
            {error && <p className="modal-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setView("confirm_cancel")}
              disabled={view === "loading"}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={view === "loading"}
            >
              {view === "loading" ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </div>
        </>
      );
    }

    // Vista 2: Confirmación de Cancelación
    if (view === "confirm_cancel") {
      return (
        <>
          <div className="modal-header">
            <h3>Confirmar Cancelación</h3>
          </div>
          <div className="modal-body">
            <p>¿Estás seguro de que deseas cancelar?</p>
            <p>Perderás la respuesta que has escrito.</p>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setView("form")}
            >
              No, volver
            </button>
            <button className="btn btn-danger" onClick={onClose}>
              Sí, Cancelar
            </button>
          </div>
        </>
      );
    }

    // Vista 3: Confirmación de Envío
    if (view === "confirm_send") {
      return (
        <>
          <div className="success-header">
            <div className="success-icon">✅</div>
            <h3>Mensaje Enviado</h3>
            <p>La respuesta fue enviada correctamente.</p>
          </div>

          <div className="success-body">
            <p>
              El cliente recibirá la respuesta y este mensaje pasó a estado{" "}
              <strong>Contestado</strong>.
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
    <div className="modal-overlay" onClick={() => setView("confirm_cancel")}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {renderView()}
      </div>
    </div>
  );
}
