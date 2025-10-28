import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CORRECCIÓN 2: Eliminada lógica de carrusel (useState, handleImageNav)
 * Ahora muestra solo 1 imagen sin indicadores porque la API solo devuelve 1 imagen
 * 
 * CORRECCIÓN NAVEGACIÓN: Agregado useNavigate para navegar al detalle
 */
export function RoomCard({ habitacion }) {
  const navigate = useNavigate();

  // 🔹 CORRECCIÓN: Handler para navegar al detalle de la habitación
  const handleVerDetalle = () => {
    console.log('🔍 Navegando a detalle de habitación:', habitacion._id);
    navigate(`/habitaciones/${habitacion._id}`);
  };

  return (
    <div className="room-card">
      {/* CORRECCIÓN 2: Contenedor simplificado - solo 1 imagen, sin dots */}
      <div className="image-carousel-container">
        <img
          src={habitacion.image1}
          alt={habitacion.name}
          className="room-card-image"
        />
      </div>
      <div className="room-card-content">
        <div className="room-card-header">
          <h3>{habitacion.name}</h3>
          <p>{habitacion.description}</p>
        </div>
        <div className="room-card-bottom-content">
          <div className="room-card-details">
            <span>Huéspedes: {habitacion.huespedes}</span>
          </div>
          <div className="room-card-footer">
            {/* 🔹 CORRECCIÓN: Botón ahora navega al detalle */}
            <button className="btn-reservar" onClick={handleVerDetalle}>
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}