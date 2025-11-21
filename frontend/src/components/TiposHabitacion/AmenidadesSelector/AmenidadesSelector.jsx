import { useState, useMemo } from 'react';
import { FaSearch, FaTimes, FaCheck } from 'react-icons/fa';
import './AmenidadesSelector.css';

export default function AmenidadesSelector({ amenidadesDisponibles, amenidadesSeleccionadas, onChange }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  
  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set(amenidadesDisponibles.map(a => a.categoria));
    return ['Todas', ...Array.from(cats).sort()];
  }, [amenidadesDisponibles]);
  
  // Filtrar amenidades
  const amenidadesFiltradas = useMemo(() => {
    return amenidadesDisponibles.filter(amenidad => {
      const matchBusqueda = amenidad.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = categoriaFiltro === 'Todas' || amenidad.categoria === categoriaFiltro;
      return matchBusqueda && matchCategoria;
    });
  }, [amenidadesDisponibles, busqueda, categoriaFiltro]);
  
  // Agrupar amenidades filtradas por categoría
  const amenidadesPorCategoria = useMemo(() => {
    const grupos = {};
    amenidadesFiltradas.forEach(amenidad => {
      if (!grupos[amenidad.categoria]) {
        grupos[amenidad.categoria] = [];
      }
      grupos[amenidad.categoria].push(amenidad);
    });
    return grupos;
  }, [amenidadesFiltradas]);
  
  // Obtener amenidades seleccionadas completas
  const amenidadesSeleccionadasCompletas = useMemo(() => {
    return amenidadesDisponibles.filter(a => amenidadesSeleccionadas.includes(a.id));
  }, [amenidadesDisponibles, amenidadesSeleccionadas]);
  
  // Handlers
  const toggleAmenidad = (amenidadId) => {
    if (amenidadesSeleccionadas.includes(amenidadId)) {
      onChange(amenidadesSeleccionadas.filter(id => id !== amenidadId));
    } else {
      onChange([...amenidadesSeleccionadas, amenidadId]);
    }
  };
  
  const quitarAmenidad = (amenidadId) => {
    onChange(amenidadesSeleccionadas.filter(id => id !== amenidadId));
  };
  
  const limpiarSeleccion = () => {
    onChange([]);
  };
  
  const seleccionarTodas = () => {
    onChange(amenidadesFiltradas.map(a => a.id));
  };
  
  return (
    <div className="amenidades-selector">
      {/* Barra de búsqueda y filtros */}
      <div className="amenidades-header">
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
        
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="categoria-select"
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      {/* Amenidades seleccionadas */}
      {amenidadesSeleccionadasCompletas.length > 0 && (
        <div className="amenidades-seleccionadas">
          <div className="seleccionadas-header">
            <h4>Seleccionadas ({amenidadesSeleccionadasCompletas.length})</h4>
            <button 
              className="btn-limpiar"
              onClick={limpiarSeleccion}
              title="Quitar todas"
            >
              <FaTimes /> Limpiar todo
            </button>
          </div>
          <div className="chips-container">
            {amenidadesSeleccionadasCompletas.map(amenidad => (
              <div key={amenidad.id} className="amenidad-chip seleccionada">
                <span className="chip-icon">{amenidad.icono}</span>
                <span className="chip-nombre">{amenidad.nombre}</span>
                <button
                  className="chip-remove"
                  onClick={() => quitarAmenidad(amenidad.id)}
                  title="Quitar"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Acciones rápidas */}
      <div className="amenidades-actions">
        <button 
          className="btn-action"
          onClick={seleccionarTodas}
          disabled={amenidadesFiltradas.length === 0}
        >
          <FaCheck /> Seleccionar todas las filtradas
        </button>
        <span className="resultados-count">
          {amenidadesFiltradas.length} amenidad{amenidadesFiltradas.length !== 1 ? 'es' : ''} disponible{amenidadesFiltradas.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Lista de amenidades disponibles */}
      <div className="amenidades-lista">
        {Object.keys(amenidadesPorCategoria).length > 0 ? (
          Object.entries(amenidadesPorCategoria).map(([categoria, amenidades]) => (
            <div key={categoria} className="categoria-grupo">
              <h5 className="categoria-titulo">{categoria}</h5>
              <div className="amenidades-grid">
                {amenidades.map(amenidad => {
                  const isSelected = amenidadesSeleccionadas.includes(amenidad.id);
                  return (
                    <div
                      key={amenidad.id}
                      className={`amenidad-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleAmenidad(amenidad.id)}
                    >
                      <div className="amenidad-content">
                        <span className="amenidad-icon">{amenidad.icono}</span>
                        <span className="amenidad-nombre">{amenidad.nombre}</span>
                      </div>
                      {isSelected && (
                        <div className="check-icon">
                          <FaCheck />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No se encontraron amenidades</p>
            {busqueda && (
              <button 
                className="btn-reset"
                onClick={() => {
                  setBusqueda('');
                  setCategoriaFiltro('Todas');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
