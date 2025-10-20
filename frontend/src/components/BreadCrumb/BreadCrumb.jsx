import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Breadcrumb.css'; 

const BREADCRUMB_NAME_MAP = {
  '/inicio': 'Inicio',
  '/habitaciones': 'Nuestras Habitaciones',
  '/servicios': 'Servicios Exclusivos',
  '/contacto': 'Contacto',
};

const Breadcrumb = () => {
  const location = useLocation();
  const path = location.pathname;
  if (path === '/') return null;
  const currentPageName = BREADCRUMB_NAME_MAP[path] || BREADCRUMB_NAME_MAP['/inicio'];
  return (
    <div className="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        Inicio
      </Link>
      
      <span className="breadcrumb-separator">{">"}</span>
      <span className="breadcrumb-active">{currentPageName}</span>
    </div>
  );
};

export default Breadcrumb;