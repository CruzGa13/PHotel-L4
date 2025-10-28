import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Breadcrumb.css'; // Mantenés tus estilos

// Mapa para nombres estáticos
const BREADCRUMB_NAME_MAP = {
  '/habitaciones': 'Nuestras Habitaciones',
  '/servicios': 'Servicios Exclusivos',
  '/contacto': 'Contacto',
  // Añade otras rutas estáticas si las tenés
};

// Componente Breadcrumb mejorado
const Breadcrumb = ({ nombreHabitacionActual }) => { // Recibe el nombre como prop
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment); // Divide la ruta: ['habitaciones', '1']

  // No mostrar nada en la homepage
  if (location.pathname === '/') return null;

  return (
    <div className="breadcrumb"> {/* Usa tus clases CSS */}
      {/* Siempre mostrar "Inicio" */}
      <Link to="/" className="breadcrumb-link">
        Inicio
      </Link>

      {/* Mapear sobre los segmentos de la ruta */}
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`; // Reconstruye la ruta hasta este punto
        const isLast = index === pathSegments.length - 1;

        let name = '';
        if (path === '/habitaciones' && isLast) {
          name = BREADCRUMB_NAME_MAP['/habitaciones']; // Nombre estático
        } else if (path.startsWith('/habitaciones/') && isLast) {
          name = nombreHabitacionActual || 'Detalle'; // Usa el nombre de la prop o 'Detalle'
        } else {
          name = BREADCRUMB_NAME_MAP[path] || segment; // Usa mapa o el segmento crudo
        }

        // Si es el último segmento, es texto activo, sino es un link
        return (
          <React.Fragment key={path}>
            <span className="breadcrumb-separator">{">"}</span>
            {isLast ? (
              <span className="breadcrumb-active">{name}</span>
            ) : (
              // Enlace al nivel intermedio (ej. /habitaciones)
              <Link to={path} className="breadcrumb-link">
                {BREADCRUMB_NAME_MAP[path] || name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;

// --- CÓMO USARLO ---
// En DetalleHabitacionPage.jsx (o donde renderices el header):
// Asegúrate de importar y renderizar este componente pasándole el nombre
// <Breadcrumb nombreHabitacionActual={tipoHabitacion?.nombre} />

// En otras páginas (ej. HabitacionesPage.jsx):
// Simplemente renderízalo sin la prop
// <Breadcrumb />