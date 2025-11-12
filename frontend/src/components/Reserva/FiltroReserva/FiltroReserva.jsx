import './FiltroReserva.css'

export default function Filters({ 
  filtros, 
  opcionesEstado, 
  opcionesTipos,
  onFiltroChange, 
  onClear 
}){

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
            placeholder="Buscar por huésped, email, habitación..."
            value={filtros.q}
            onChange={(e) => onFiltroChange('q', e.target.value)}
          />
        </div>
      </div>

      {/* Filtros de fecha y selects */}
      <div className="grid">
        <div>
          <label>Fecha Check-In Desde</label>
          <input 
            type="date" 
            className="input"
            value={filtros.fechaDesde}
            onChange={(e) => onFiltroChange('fechaDesde', e.target.value)}
          />
        </div>
        <div>
          <label>Fecha Check-Out Hasta</label>
          <input 
            type="date" 
            className="input"
            value={filtros.fechaHasta}
            onChange={(e) => onFiltroChange('fechaHasta', e.target.value)}
          />
        </div>
        <div>
          <label>Estado</label>
          <select 
            className="select"
            value={filtros.estado}
            onChange={(e) => onFiltroChange('estado', e.target.value)}
          >
            <option value="Todos">Todos</option>
            {opcionesEstado
              ?.filter(e => e && e.trim() && e.trim().toLowerCase() !== 'todos')
              .map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
          </select>
        </div>
        <div>
          <label>Tipo de Habitación</label>
          <select 
            className="select"
            value={filtros.tipoHabitacion}
            onChange={(e) => onFiltroChange('tipoHabitacion', e.target.value)}
          >
            <option value="Todos">Todos</option>
            {opcionesTipos
              ?.filter(t => t && t.trim() && t.trim().toLowerCase() !== 'todos')
              .map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
          </select>
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
          onClick={() => {/* Los filtros se aplican automáticamente con onChange */}}
        >
          Aplicar Filtros
        </button>
      </div>
    </section>
  )
}