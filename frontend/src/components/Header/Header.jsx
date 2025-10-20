import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-image-container">
        <img 
          src="/inicio_hotel_rios_agua_viva.png" 
          alt="Montañas y cascada"
          className="header-bg-image"
        />
        <div className="header-overlay"></div>
        <div className="header-content">
          <h1 className="header-title">Ríos de Agua Viva</h1>
          <p className="header-subtitle">Hotel</p>
        </div>
      </div>
    </header>
  );
};

export default Header;