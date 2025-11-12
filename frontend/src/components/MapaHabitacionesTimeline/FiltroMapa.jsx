import './FiltroMapa.css';

export default function FiltroMapa({ 
  filtros, 
  opcionesCategorias,
  onFiltroChange, 
  onBuscar,
  onLimpiar 
}) {

  return (
    <section className="filtro-mapa-container">
      <h3 className="filtro-mapa-title">Filtros de Habitaciones</h3>
      
      {/* Filtros uno al lado del otro */}
      <div className="filtro-mapa-grid">
        <div className="filtro-mapa-field">
          <label className="filtro-mapa-label">Categoría</label>
          <select 
            className="filtro-mapa-select"
            value={filtros.categoria}
            onChange={(e) => onFiltroChange('categoria', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {opcionesCategorias?.map(categoria => (
              <option key={categoria.id} value={categoria.nombre}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-mapa-field">
          <label className="filtro-mapa-label">Tipo de Habitación</label>
          <input 
            type="text" 
            className="filtro-mapa-input" 
            placeholder="Escribir tipo de habitación..."
            value={filtros.tipoHabitacion}
            onChange={(e) => onFiltroChange('tipoHabitacion', e.target.value)}
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="filtro-mapa-actions">
        <button 
          className="filtro-mapa-btn filtro-mapa-btn-limpiar"
          onClick={onLimpiar}
        >
          Limpiar Filtros
        </button>
        <button 
          className="filtro-mapa-btn filtro-mapa-btn-buscar"
          onClick={onBuscar}
        >
          Buscar
        </button>
      </div>
    </section>
  );
}
