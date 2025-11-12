import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './BreadCrumb.css'; // Estilos del breadcrumb

// Mapa para nombres estáticos
const BREADCRUMB_NAME_MAP = {
  '/habitaciones': 'Nuestras Habitaciones',
  '/servicios': 'Servicios Exclusivos',
  '/contacto': 'Contacto',
  // Añade otras rutas estáticas si las tenés
};

/**
 * Componente BreadCrumb
 * 
 * Soporta dos modos:
 * 1. Automático ("auto"): genera breadcrumbs basado en la ruta actual
 * 2. Controlado ("controlled"): usa la prop `items` para control total
 * 
 * @param {Array} items - Array de objetos { label, to?, current? }
 * @param {string} mode - "auto" | "controlled" (default: "auto")
 * @param {string} separator - Separador visual (default: ">")
 * @param {string} nombreHabitacionActual - Nombre de habitación (modo automático)
 */
const BreadCrumb = ({ items, mode = 'auto', separator = '>', nombreHabitacionActual }) => {
  const location = useLocation();

  // No mostrar nada en la homepage
  if (location.pathname === '/') return null;

  // MODO CONTROLADO: Si se especifica mode="controlled" o se pasan items
  const isControlled = mode === 'controlled' || (items && items.length > 0);
  
  if (isControlled && items && items.length > 0) {
    return (
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = item.current || index === items.length - 1;
          
          return (
            <React.Fragment key={item.to || `item-${index}`}>
              {!isFirst && <span className="breadcrumb-separator" aria-hidden="true">{` ${separator} `}</span>}
              
              {isLast || !item.to ? (
                <span className="breadcrumb-active" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  // MODO AUTOMÁTICO: genera breadcrumbs desde la ruta
  const pathSegments = location.pathname.split('/').filter(segment => segment);

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {/* Siempre mostrar "Inicio" */}
      <Link to="/" className="breadcrumb-link">
        Inicio
      </Link>

      {/* Mapear sobre los segmentos de la ruta */}
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;

        let name = '';
        if (path === '/habitaciones' && isLast) {
          name = BREADCRUMB_NAME_MAP['/habitaciones'];
        } else if (path.startsWith('/habitaciones/') && isLast) {
          name = nombreHabitacionActual || 'Detalle';
        } else {
          name = BREADCRUMB_NAME_MAP[path] || segment;
        }

        return (
          <React.Fragment key={path}>
            <span className="breadcrumb-separator" aria-hidden="true">{` ${separator} `}</span>
            {isLast ? (
              <span className="breadcrumb-active" aria-current="page">{name}</span>
            ) : (
              <Link to={path} className="breadcrumb-link">
                {BREADCRUMB_NAME_MAP[path] || name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadCrumb;

// --- CÓMO USARLO ---

// OPCIÓN 1: Modo automático (basado en ruta)
// <BreadCrumb nombreHabitacionActual={tipoHabitacion?.nombre} />

// OPCIÓN 2: Modo controlado (items personalizados, sin auto)
// <BreadCrumb
//   mode="controlled"
//   items={[
//     { label: "Inicio", to: "/" },
//     { label: "Nuestras habitaciones", to: "/habitaciones" },
//     { label: "Suite Premium", current: true }
//   ]}
// />

// OPCIÓN 3: Separador personalizado
// <BreadCrumb mode="controlled" separator="/" items={[...]} />