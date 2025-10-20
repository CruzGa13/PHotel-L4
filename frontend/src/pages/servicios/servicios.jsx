import React from 'react';
import ServicesImages from '../../components/ServicesImages/ServicesImages'; 
import ServiciosIcon from '../../components/ServiciosIcon/ServiciosIcon'; 
import './Servicios.css'; 

const ServiciosModule = () => {
  return (
    <div className="servicios-page">
      <div className="servicios__container">
        <div className="servicios__header">
          <h1 className="servicios__title">Nuestros Servicios Exclusivos</h1>
          <p className="servicios__subtitle">
            Sumérgete en una experiencia completa. Desde la aventura hasta la relajación,
            nuestros servicios están diseñados para complementar tu estancia en la montaña.
          </p>
        </div>

        <div className="servicios__content">
          {/* SECCIÓN 1: Servicios de Aventura/Experiencia (con Imágenes Grandes) */}
          <ServicesImages />

          {/* SECCIÓN 2: Servicios de Comodidad/Amenities (con Iconos) */}
          <div className="servicios-amenities-section">
            <ServiciosIcon />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ServiciosModule;