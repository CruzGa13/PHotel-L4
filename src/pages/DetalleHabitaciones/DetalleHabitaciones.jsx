import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./DetalleHabitaciones.css";
import imgPlaceholder1 from "/src/assets/Habitaciones/card_habitacion_activa.png";
import imgPlaceholder2 from "/src/assets/habitaciones/card_habitacion_inactiva.png";

export default function DetalleHabitacion() {
  const location = useLocation();
  const navigate = useNavigate();

  const [habitacion, setHabitacion] = useState(location.state?.habitacion);
  const [estadoOriginal] = useState(location.state?.habitacion?.estado);

  const handleEstadoToggle = () => {
    const nuevoEstado = habitacion.estado === "Activa" ? "Inactiva" : "Activa";
    setHabitacion({ ...habitacion, estado: nuevoEstado });
  };

  const handleGuardarCambios = () => {
    console.log("Guardando cambios:", habitacion);
    navigate("/");
  };

  if (!habitacion) {
    // (Tu manejo de error está perfecto, lo dejamos igual)
    return (
      <div className="page">
        <main className="container-main fade-in">
          {/* ... tu JSX de error ... */}
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="container-main fade-in">
        
        {/* Breadcrumb y Cabecera (Esto está bien) */}
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="sep">›</span>
          <Link to="/">Habitaciones</Link>
          <span className="sep">›</span>
          <span className="pink">#{habitacion.nro_habitacion}</span>
        </div>

        <div className="head-top">
          <div>
            <h2 className="gradient-text">{habitacion.nombre}</h2>
            <p className="muted">Detalle y gestión de la habitación.</p>
          </div>
          <Link to="/" className="btn btn-gray">
            Volver a la lista
          </Link>
        </div>

        {/* NUEVA ESTRUCTURA: 
          Reemplazamos 'modal-content' y 'modal-body' por un layout de página 
        */}
        <section className="glass detalle-layout">
          
          {/* --- COLUMNA IZQUIERDA: GALERÍA --- */}
          <div className="detalle-col-gallery">
            <div className="gallery">
              <h4>Galería de Imágenes</h4>
              <div className="image-grid">
                <img
                  src={imgPlaceholder1}
                  alt="Imagen 1 de la habitación"
                  className="gallery-img"
                />
                <img
                  src={imgPlaceholder2}
                  alt="Imagen 2 de la habitación"
                  className="gallery-img"
                />
                {/* Puedes agregar más imágenes aquí si quieres */}
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: INFORMACIÓN --- */}
          <div className="detalle-col-info">
            {/* Sección de Detalles */}
            <div className="details">
              <h4>Información General</h4>
              <div className="info-grid">
                <div>
                  <label>Categoría</label>
                  <p>{habitacion.categoria}</p>
                </div>
                <div>
                  <label>Tipo de Espacio</label>
                  <p>{habitacion.tipo_espacio}</p>
                </div>
                <div>
                  <label>Max. Huéspedes</label>
                  <p>{habitacion.cantidad_huespedes}</p>
                </div>
                <div>
                  <label>Fecha de Registro</label>
                  <p>{habitacion.fecha_registro}</p>
                </div>
              </div>
              <div className="info-full">
                <label>Observaciones</label>
                <p>{habitacion.observacion || "Sin observaciones."}</p>
              </div>
            </div>

            {/* Sección de Gestión de Estado */}
            <div className="estado-section">
              <h4>Gestión de Estado</h4>
              <p>
                La habitación se encuentra actualmente:
                <span
                  className={`badge modal-badge ${
                    habitacion.estado === "Activa" ? "confirmada" : "cancelada"
                  }`}
                >
                  {habitacion.estado}
                </span>
              </p>
              <button className="btn btn-gray" onClick={handleEstadoToggle}>
                {habitacion.estado === "Activa"
                  ? "Marcar como Inactiva"
                  : "Marcar como Activa"}
              </button>
            </div>

            {/* Pie (Acciones) */}
            <div className="detalle-footer">
              <button
                className="btn btn-blue"
                onClick={handleGuardarCambios}
                disabled={habitacion.estado === estadoOriginal}
              >
                Guardar Cambios
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}