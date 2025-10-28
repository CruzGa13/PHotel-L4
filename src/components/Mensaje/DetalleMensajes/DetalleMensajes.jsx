import React from "react";
import "./DetalleMensajes.css";
import { FaTimes } from "react-icons/fa";

export default function DetalleMensajes({ mensaje, onClose }) {
  if (!mensaje) return null;
  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div className="detalle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detalle-header">
          <h3>Detalle del Mensaje</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="detalle-content">
          {/* INFORMACIÓN BÁSICA */}
          <p>
            <strong>Nro de Mensaje:</strong> {mensaje.id}
          </p>
          <p>
            <strong>Cliente:</strong> {mensaje.cliente}
          </p>
          <p>
            <strong>Email:</strong> {mensaje.email}
          </p>
          <p>
            <strong>Fecha:</strong> {mensaje.fecha}
          </p>
          {mensaje.hora && (
            <p>
              <strong>Hora:</strong> {mensaje.hora}
            </p>
          )}

          {/* ESTADO VISUAL */}
          <p>
            <strong>Estado: </strong>
            <span
              className={`estado-tag ${
                mensaje.estado === "Sin Responder"
                  ? "estado-rojo"
                  : "estado-verde"
              }`}
            >
              {mensaje.estado}
            </span>
          </p>

          {/* MENSAJE */}
          <div className="detalle-mensaje-box">
            <strong>Mensaje del Cliente:</strong>
            <p>{mensaje.mensaje}</p>
          </div>
          {mensaje.estado === "Contestado" && mensaje.respuesta && (
            <div className="detalle-respuesta-box">
              <strong>Respuesta Enviada:</strong>
              <p>{mensaje.respuesta}</p>
            </div>
          )}

          {/* HISTORIAL DE MOVIMIENTOS */}
          <div className="historial-box">
            <h4>Historial de Movimientos</h4>

            {mensaje.estado === "Contestado" ? (
              <ul>
                <li>
                  <strong>Respondido por:</strong>{" "}
                  {mensaje.respondidoPor || "Usuario del Sistema"}
                </li>
                <li>
                  <strong>Fecha de Respuesta:</strong> {mensaje.fechaRespuesta}
                </li>
                <li>
                  <strong>Hora:</strong> {mensaje.horaRespuesta}
                </li>
              </ul>
            ) : (
              <p className="no-movimientos">Sin registros aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
