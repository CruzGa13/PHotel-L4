import React, { useState } from 'react';

export function RoomCard({ habitacion }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const handleImageNav = (index) => {
    setActiveImageIndex(index);
  };
  return (
    <div className="room-card">
      <div className="image-carousel-container">
        <img
          src={habitacion.image1}
          alt={`${habitacion.name} - Imagen 1`}
          className={`room-card-image ${activeImageIndex === 0 ? 'active-image' : ''}`}
        />
        <img
          src={habitacion.image2}
          alt={`${habitacion.name} - Imagen 2`}
          className={`room-card-image ${activeImageIndex === 1 ? 'active-image' : ''}`}
        />
        <div className="carousel-dots">
          {[0, 1].map(index => (
            <span
              key={index}
              className={`dot ${activeImageIndex === index ? 'active' : ''}`}
              onClick={() => handleImageNav(index)}
            ></span>
          ))}
        </div>
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
            <button className="btn-reservar">Reservar</button>
          </div>
        </div>
      </div>
    </div>
  );
}