import './FiltroOperadores.css';

export default function FiltroOperadores({ 
  filtros, 
  onFiltroChange, 
  onClear,
  onApply 
}) {

  return (
    <section className="glass filters">
      <h3>Filtros de Búsqueda</h3>
      
      {/* Búsqueda general */}
      <div className="grid one">
        <div>
          <label>Búsqueda General</label>
          <input 
            type="text" 
            className="input" 
            placeholder="Buscar por nombre, email o teléfono..."
            value={filtros.q || ''}
            onChange={(e) => onFiltroChange('q', e.target.value)}
          />
        </div>
      </div>

      {/* Filtros de estado y fecha */}
      <div className="grid">
        <div>
          <label>Estado</label>
          <select 
            className="select"
            value={filtros.estado || 'Todos'}
            onChange={(e) => onFiltroChange('estado', e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <label>Fecha Registro Desde</label>
          <input 
            type="date" 
            className="input"
            value={filtros.fechaDesde || ''}
            onChange={(e) => onFiltroChange('fechaDesde', e.target.value)}
          />
        </div>
        <div>
          <label>Fecha Registro Hasta</label>
          <input 
            type="date" 
            className="input"
            value={filtros.fechaHasta || ''}
            onChange={(e) => onFiltroChange('fechaHasta', e.target.value)}
          />
        </div>
      </div>

      <div className="actions">
        <button 
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-purple-600 text-purple-700 hover:bg-purple-50 active:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onClear}
        >
          Limpiar Filtros
        </button>
        <button 
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onApply}
        >
          Aplicar Filtros
        </button>
      </div>
    </section>
  );
}
