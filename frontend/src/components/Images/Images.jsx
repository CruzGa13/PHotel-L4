import React from 'react';
import './Images.css';
const Images = () => {
  return (
    <div className="gallery-background">
      <div className="gallery-container">
        <div className="gallery-item item-1">
          <img src="/jacuzzi_hotel.png" alt="Jacuzzi exterior con fogata en el bosque por la noche" />
        </div>
        <div className="gallery-item item-2">
          <img src="/comedor_hotel.png" alt="Terraza de un restaurante con vistas a las montañas" />
        </div>
        <div className="gallery-item item-3">
          <img src="/barra_hotel.png" alt="Bar rústico y elegante con taburetes de madera" />
        </div>
      </div>
    </div>
  );
};

export default Images;