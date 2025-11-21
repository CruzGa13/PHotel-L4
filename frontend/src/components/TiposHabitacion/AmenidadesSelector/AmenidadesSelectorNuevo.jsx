import { useState, useMemo } from 'react';
import { 
  FaSearch, FaTimes, FaCheckCircle, FaCircle,
  FaBath, FaSnowflake, FaTv, FaPhone, FaLock, FaWifi, FaKey,
  FaChair, FaCoffee, FaTemperatureHigh, FaDesktop
} from 'react-icons/fa';
import { MdKingBed, MdDry, MdKitchen, MdRouter } from 'react-icons/md';
import './AmenidadesSelectorNuevo.css';

// Mapeo de iconos - IGUAL que en DetalleTipoHabitacion (nombres de BD)
const iconMap = {
  'bath': FaBath,
  'ac_unit': FaSnowflake,
  'kitchen': MdKitchen,
  'tv': FaTv,
  'phone': FaPhone,
  'dryer': MdDry,
  'thermostat': FaTemperatureHigh,
  'lock': FaLock,
  'wifi': FaWifi,
  'key': FaKey,
  'desk': FaDesktop,
  'chair': FaChair,
  'coffee': FaCoffee,
  'wifi_tethering': MdRouter,
  'default': FaCircle
};

const getIconComponent = (iconString) => {
  if (!iconString) {
    console.warn('⚠️ Icono no definido, usando default');
    return iconMap.default;
  }
  
  const key = iconString.toLowerCase().trim();
  const IconComponent = iconMap[key];
  
  if (!IconComponent) {
    console.warn(`⚠️ Icono "${iconString}" no encontrado en el mapa, usando default. Valor recibido: "${iconString}"`);
    return iconMap.default;
  }
  
  return IconComponent;
};

export default function AmenidadesSelectorNuevo({ amenidadesDisponibles, amenidadesSeleccionadas, onChange }) {
  const [busqueda, setBusqueda] = useState('');
  
  // Debug: Verificar props recibidas
  console.log('🎯 AmenidadesSelectorNuevo - Props recibidas:', {
    totalDisponibles: amenidadesDisponibles.length,
    idsSeleccionados: amenidadesSeleccionadas,
    cantidadSeleccionados: amenidadesSeleccionadas.length
  });
  
  // Separar amenidades en seleccionadas y no seleccionadas
  const { seleccionadas, noSeleccionadas } = useMemo(() => {
    const sel = [];
    const noSel = [];
    
    console.log('🔄 Separando amenidades...');
    console.log('📋 Total disponibles:', amenidadesDisponibles.length);
    console.log('✅ IDs seleccionados:', amenidadesSeleccionadas);
    
    amenidadesDisponibles.forEach(amenidad => {
      // Filtrar por búsqueda
      if (busqueda && !amenidad.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
        return;
      }
      
      if (amenidadesSeleccionadas.includes(amenidad.id)) {
        sel.push(amenidad);
      } else {
        noSel.push(amenidad);
      }
    });
    
    console.log('✨ Seleccionadas:', sel.length, sel.map(a => a.nombre));
    console.log('📦 No seleccionadas:', noSel.length, noSel.map(a => a.nombre));
    
    return { seleccionadas: sel, noSeleccionadas: noSel };
  }, [amenidadesDisponibles, amenidadesSeleccionadas, busqueda]);
  
  // Toggle amenidad
  const toggleAmenidad = (amenidadId) => {
    if (amenidadesSeleccionadas.includes(amenidadId)) {
      onChange(amenidadesSeleccionadas.filter(id => id !== amenidadId));
    } else {
      onChange([...amenidadesSeleccionadas, amenidadId]);
    }
  };
  
  // Renderizar item de amenidad
  const renderAmenidad = (amenidad, isSelected) => {
    const IconComponent = getIconComponent(amenidad.icono);
    
    return (
      <div
        key={amenidad.id}
        className={`amenidad-checkbox-item ${isSelected ? 'selected' : ''}`}
        onClick={() => toggleAmenidad(amenidad.id)}
      >
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // Manejado por el onClick del div
            className="amenidad-checkbox"
          />
          <span className="checkbox-custom">
            {isSelected && <FaCheckCircle className="check-icon" />}
          </span>
        </div>
        
        <div className="amenidad-icon-wrapper">
          <IconComponent className="amenidad-icon" />
        </div>
        
        <div className="amenidad-info">
          <span className="amenidad-nombre">{amenidad.nombre}</span>
          {amenidad.descripcion && (
            <span className="amenidad-descripcion">{amenidad.descripcion}</span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="amenidades-selector-nuevo">
      {/* Header con búsqueda */}
      <div className="selector-header">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar amenidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          {busqueda && (
            <button 
              className="clear-search"
              onClick={() => setBusqueda('')}
              title="Limpiar búsqueda"
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        <div className="contador-amenidades">
          <span className="contador-badge seleccionadas">
            {seleccionadas.length} seleccionadas
          </span>
          <span className="contador-badge disponibles">
            {noSeleccionadas.length} disponibles
          </span>
        </div>
      </div>
      
      {/* Grid de dos columnas */}
      <div className="amenidades-grid-dos-columnas">
        {/* Columna izquierda: Seleccionadas */}
        <div className="columna-amenidades">
          <div className="columna-header seleccionadas">
            <FaCheckCircle className="header-icon" />
            <h3>Amenidades Seleccionadas</h3>
            <span className="count-badge">{seleccionadas.length}</span>
          </div>
          
          <div className="columna-content">
            {seleccionadas.length > 0 ? (
              seleccionadas.map(amenidad => renderAmenidad(amenidad, true))
            ) : (
              <div className="empty-state">
                <FaCircle className="empty-icon" />
                <p>No hay amenidades seleccionadas</p>
                <span className="empty-hint">
                  Seleccioná amenidades de la columna derecha
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Columna derecha: Disponibles */}
        <div className="columna-amenidades">
          <div className="columna-header disponibles">
            <FaCircle className="header-icon" />
            <h3>Amenidades Disponibles</h3>
            <span className="count-badge">{noSeleccionadas.length}</span>
          </div>
          
          <div className="columna-content">
            {noSeleccionadas.length > 0 ? (
              noSeleccionadas.map(amenidad => renderAmenidad(amenidad, false))
            ) : (
              <div className="empty-state">
                <FaCheckCircle className="empty-icon success" />
                <p>Todas las amenidades están seleccionadas</p>
                {busqueda && (
                  <span className="empty-hint">
                    O no hay resultados para "{busqueda}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
