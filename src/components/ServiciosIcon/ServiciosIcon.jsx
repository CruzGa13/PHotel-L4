import React from 'react'; // Ya no necesitamos useState
// Asegúrate de que esta ruta sea correcta para tu proyecto
import { servicios_2 } from "../../assets/assets.js"; 
import './ServiciosIcon.css';

const ServiciosIcon = () => {
  return (
    <div className="servicios-icon-grid">
      {servicios_2.map((servicio) => (
        // Usamos el ServiceIconCard simple sin estados
        <ServiceIconCard key={servicio._id} servicio={servicio} />
      ))}
    </div>
  );
};

const ServiceIconCard = ({ servicio }) => {
  return (
    <div className="service-icon-card"> 
      <div className="service-icon-container">
        <div className="icon-wrapper">
          <img
            src={servicio.image}
            alt={servicio.name}
            className="service-icon-image"
          />
        </div>
      </div>
      <h3 className="service-icon-name">{servicio.name}</h3>
      <p className="service-icon-description-permanent">{servicio.description}</p>
    </div>
  );
};

export default ServiciosIcon;