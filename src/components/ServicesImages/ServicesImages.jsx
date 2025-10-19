import React, { useState } from 'react';
import { servicios } from "../../assets/assets.js";
import './ServicesImages.css';

const ServicesImages = () => {
  return (
    <div className="services-grid">
      {servicios.map((servicio, index) => (
        <ServiceCard key={servicio._id} servicio={servicio} />
      ))}
    </div>
  );
};

const ServiceCard = ({ servicio }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="service-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="service-image-container">
        {!isHovered && (
          <img
            src={servicio.image}
            alt={servicio.name}
            className="service-image"
          />
        )}
        {isHovered && (
          <div className="service-overlay">
            <h3 className="service-overlay-name">{servicio.name}</h3>
            <p className="service-overlay-description">{servicio.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesImages;