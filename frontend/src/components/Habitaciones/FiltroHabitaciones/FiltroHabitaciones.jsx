export default function FiltroHabitaciones({ 
  filters, 
  categorias = [], 
  tiposHabitacion = [], 
  onFilterChange, 
  onSearch, 
  onClear,
  disabled = false,
}) {
  return (
    <section className="glass p-6 rounded-2xl mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Filtros de Habitaciones
      </h3>
      
      <form className="grid grid-cols-12 gap-4" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
        {/* Fila 1: Categoría, Tipo de Habitación, Cant. de Huéspedes */}
        <div className="col-span-12 md:col-span-4">
          <label 
            htmlFor="categoria" 
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Categoría
          </label>
          <select
            id="categoria"
            aria-label="Categoría"
            value={filters.categoriaId}
            onChange={(e) => onFilterChange('categoriaId', e.target.value)}
            disabled={disabled}
            className="w-full min-h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label 
            htmlFor="tipo-habitacion" 
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Tipo de Habitación
          </label>
          <select
            id="tipo-habitacion"
            aria-label="Tipo de Habitación"
            value={filters.tipoHabitacionId}
            onChange={(e) => onFilterChange('tipoHabitacionId', e.target.value)}
            disabled={disabled}
            className="w-full min-h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Todos</option>
            {tiposHabitacion.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label 
            htmlFor="capacidad" 
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Capacidad Mínima
          </label>
          <input
            id="capacidad"
            type="number"
            aria-label="Capacidad Mínima"
            value={filters.capacidad}
            onChange={(e) => onFilterChange('capacidad', e.target.value)}
            disabled={disabled}
            className="w-full min-h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Ej: 2"
            min="1"
          />
        </div>

        {/* Fila 2: Nro de Habitación (búsqueda) */}
        <div className="col-span-12">
          <label 
            htmlFor="nro-habitacion" 
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Buscar Habitación
          </label>
          <input
            id="nro-habitacion"
            type="text"
            aria-label="Buscar Habitación"
            value={filters.q}
            onChange={(e) => onFilterChange('q', e.target.value)}
            disabled={disabled}
            className="w-full min-h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Buscar por número o tipo de habitación..."
          />
        </div>

        {/* Barra de acciones */}
        <div className="col-span-12 flex flex-col gap-2 md:flex-row md:items-center md:justify-between mt-2">
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="inline-flex items-center justify-center px-4 py-2 rounded-2xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-500 hover:bg-emerald-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto order-2 md:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar Filtros
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center justify-center px-4 py-2 rounded-2xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto order-1 md:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? 'Buscando...' : 'Buscar Habitaciones'}
          </button>
        </div>
      </form>
    </section>
  )
}