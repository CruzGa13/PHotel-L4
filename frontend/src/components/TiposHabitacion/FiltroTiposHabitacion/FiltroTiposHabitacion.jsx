import './FiltroTiposHabitacion.css';

export default function FiltroTiposHabitacion({ 
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
            placeholder="Buscar por nombre o categoría..."
            value={filtros.q || ''}
            onChange={(e) => onFiltroChange('q', e.target.value)}
          />
        </div>
      </div>

      {/* Filtros de capacidad y precio */}
      <div className="grid">
        <div>
          <label>Capacidad</label>
          <select 
            className="select"
            value={filtros.capacidad || 'Todas'}
            onChange={(e) => onFiltroChange('capacidad', e.target.value)}
          >
            <option value="Todas">Todas</option>
            <option value="1">1 huésped</option>
            <option value="2">2 huéspedes</option>
            <option value="3">3 huéspedes</option>
            <option value="4">4 huéspedes</option>
            <option value="5+">5 o más huéspedes</option>
          </select>
        </div>
        <div>
          <label>Precio Desde</label>
          <input 
            type="text"
            className="input"
            placeholder="$ 0"
            value={filtros.precioDesde ? `$ ${Number(filtros.precioDesde).toLocaleString('es-AR')}` : ''}
            onChange={(e) => {
              // Remover $ y puntos, mantener solo números
              const valor = e.target.value.replace(/[$.\s]/g, '');
              onFiltroChange('precioDesde', valor);
            }}
          />
        </div>
        <div>
          <label>Precio Hasta</label>
          <input 
            type="text"
            className="input"
            placeholder="$ 0"
            value={filtros.precioHasta ? `$ ${Number(filtros.precioHasta).toLocaleString('es-AR')}` : ''}
            onChange={(e) => {
              // Remover $ y puntos, mantener solo números
              const valor = e.target.value.replace(/[$.\s]/g, '');
              onFiltroChange('precioHasta', valor);
            }}
          />
        </div>
      </div>

      <div className="actions">
        <button 
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onClear}
        >
          Limpiar Filtros
        </button>
        <button 
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onApply}
        >
          Aplicar Filtros
        </button>
      </div>
    </section>
  );
}
