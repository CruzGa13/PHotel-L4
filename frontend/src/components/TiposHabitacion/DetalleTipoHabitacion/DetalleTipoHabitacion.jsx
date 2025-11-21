import React from 'react';
import { 
  FaTimes, FaBed, FaUsers, FaRulerCombined, FaEye, FaDollarSign, FaCheckCircle,
  FaBath, FaSnowflake, FaTv, FaPhone, FaLock, FaWifi, FaKey,
  FaChair, FaCoffee, FaTemperatureHigh, FaDesktop
} from 'react-icons/fa';
import { MdKingBed, MdDry, MdKitchen, MdRouter } from 'react-icons/md';
import './DetalleTipoHabitacion.css';

// Objeto de mapeo de iconos (igual que en ListaAmenidades)
const iconMap = {
  'bath': <FaBath />,
  'ac_unit': <FaSnowflake />,
  'kitchen': <MdKitchen />,
  'tv': <FaTv />,
  'phone': <FaPhone />,
  'dryer': <MdDry />,
  'thermostat': <FaTemperatureHigh />,
  'lock': <FaLock />,
  'wifi': <FaWifi />,
  'key': <FaKey />,
  'desk': <FaDesktop />,
  'chair': <FaChair />,
  'coffee': <FaCoffee />,
  'wifi_tethering': <MdRouter />,
  'default': null
};

// Función helper para obtener el componente de icono
const getIconComponent = (iconString) => {
  if (!iconString) return iconMap.default;
  return iconMap[iconString.toLowerCase()] || iconMap.default;
};

export default function DetalleTipoHabitacion({ tipo, onClose }) {
  if (!tipo) return null;

  // Formatear precio
  const formatearPrecio = (precio) => {
    return `$ ${precio.toLocaleString('es-AR')}`;
  };

  // Obtener badge de estado de habitación
  const getEstadoBadge = (estado) => {
    const estados = {
      'Disponible': { color: '#10b981', bg: '#d1fae5', text: 'Disponible' },
      'Ocupada': { color: '#ef4444', bg: '#fee2e2', text: 'Ocupada' },
      'Mantenimiento': { color: '#f59e0b', bg: '#fef3c7', text: 'Mantenimiento' },
      'Limpieza': { color: '#3b82f6', bg: '#dbeafe', text: 'Limpieza' }
    };
    return estados[estado] || estados['Disponible'];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-detalle" onClick={(e) => e.stopPropagation()}>
        {/* Header del Modal */}
        <div className="modal-header-detalle">
          <div className="header-left">
            <h2 className="modal-title-detalle">{tipo.nombre}</h2>
            <div className="header-meta">
              <span className="categoria-badge">{tipo.categoria}</span>
              <span className="ocupacion-info">
                <FaUsers /> Hasta {tipo.capacidadMaxima} huéspedes
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className="precio-destacado">
              <span className="precio-label">Precio base</span>
              <span className="precio-valor">{formatearPrecio(tipo.tarifaBase)}</span>
              <span className="precio-periodo">/ noche</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Cerrar">
            <FaTimes />
          </button>
        </div>

        {/* Body del Modal */}
        <div className="modal-body-detalle">
          {/* Sección 1: Datos Generales */}
          <section className="detalle-section">
            <h3 className="section-title">
              <FaBed /> Datos Generales
            </h3>
            <div className="section-grid">
              <div className="field-item full-width">
                <label className="field-label">Descripción</label>
                <p className="field-value descripcion-completa">{tipo.descripcion}</p>
              </div>
              
              <div className="field-item">
                <label className="field-label">Categoría</label>
                <div className="field-value">
                  <span className="categoria-chip">{tipo.categoria}</span>
                </div>
              </div>
              
              <div className="field-item">
                <label className="field-label">Ocupación</label>
                <div className="field-value">
                  <FaUsers className="field-icon" /> {tipo.ocupacion}
                </div>
              </div>
              
              <div className="field-item">
                <label className="field-label">Capacidad</label>
                <div className="field-value">
                  <FaUsers className="field-icon" /> {tipo.capacidadMaxima} personas
                </div>
              </div>
              
              <div className="field-item">
                <label className="field-label">Descripción de camas</label>
                <div className="field-value">
                  <MdKingBed className="field-icon" /> {tipo.descripcionCamas}
                </div>
              </div>
              
              {tipo.superficie && (
                <div className="field-item">
                  <label className="field-label">Superficie</label>
                  <div className="field-value">
                    <FaRulerCombined className="field-icon" /> {tipo.superficie} m²
                  </div>
                </div>
              )}
              
              {tipo.vista && (
                <div className="field-item">
                  <label className="field-label">Vista</label>
                  <div className="field-value">
                    <FaEye className="field-icon" /> {tipo.vista}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sección 2: Tarifas y Políticas */}
          <section className="detalle-section">
            <h3 className="section-title">
              <FaDollarSign /> Tarifas y Políticas
            </h3>
            <div className="section-grid">
              <div className="field-item">
                <label className="field-label">Tarifa base</label>
                <div className="field-value precio-grande">
                  {formatearPrecio(tipo.tarifaBase)}
                  <span className="precio-periodo-small">/ noche</span>
                </div>
              </div>
              
              <div className="field-item full-width">
                <label className="field-label">Políticas</label>
                <p className="field-value politicas-text">{tipo.politicas}</p>
              </div>
            </div>
          </section>

          {/* Sección 3: Amenidades */}
          {tipo.amenidades && tipo.amenidades.length > 0 && (
            <section className="detalle-section">
              <h3 className="section-title">
                <FaCheckCircle /> Amenidades
              </h3>
              <div className="amenidades-grid">
                {tipo.amenidades.map((amenidad, index) => {
                  const IconComponent = getIconComponent(amenidad.icono);
                  return (
                    <div key={index} className="amenidad-chip">
                      <span className="amenidad-icon">
                        {IconComponent ? (
                          React.cloneElement(IconComponent, { className: "w-full h-full" })
                        ) : (
                          <span className="text-xs text-gray-400">{amenidad.icono || '?'}</span>
                        )}
                      </span>
                      <span className="amenidad-nombre">{amenidad.nombre}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sección 4: Habitaciones Vinculadas */}
          {tipo.habitacionesVinculadas && tipo.habitacionesVinculadas.length > 0 && (
            <section className="detalle-section">
              <h3 className="section-title">
                <FaBed /> Habitaciones Vinculadas
              </h3>
              <div className="habitaciones-info">
                <p className="total-habitaciones">
                  Total: <strong>{tipo.habitacionesVinculadas.length} habitaciones</strong>
                </p>
                <div className="habitaciones-lista">
                  {tipo.habitacionesVinculadas.slice(0, 5).map((hab, index) => {
                    const estadoBadge = getEstadoBadge(hab.estado);
                    return (
                      <div key={index} className="habitacion-item">
                        <span className="habitacion-numero">{hab.numero}</span>
                        <span className="habitacion-piso">Piso {hab.piso}</span>
                        <span 
                          className="habitacion-estado"
                          style={{ 
                            backgroundColor: estadoBadge.bg, 
                            color: estadoBadge.color 
                          }}
                        >
                          {estadoBadge.text}
                        </span>
                      </div>
                    );
                  })}
                  {tipo.habitacionesVinculadas.length > 5 && (
                    <div className="ver-mas">
                      + {tipo.habitacionesVinculadas.length - 5} más
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Sección 5: Imágenes */}
          {tipo.imagenes && tipo.imagenes.length > 0 && (
            <section className="detalle-section">
              <h3 className="section-title">
                📷 Imágenes ({tipo.imagenes.length})
              </h3>
              <div className="imagenes-grid">
                {tipo.imagenes.map((imagen, index) => (
                  <div key={index} className="imagen-thumbnail">
                    <img src={imagen.url} alt={imagen.descripcion || `Imagen ${index + 1}`} />
                    {imagen.descripcion && (
                      <div className="imagen-overlay">
                        <span>{imagen.descripcion}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="modal-footer-detalle">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
