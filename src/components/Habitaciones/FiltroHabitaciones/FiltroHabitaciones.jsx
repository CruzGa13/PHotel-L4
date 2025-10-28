import './FiltroHabitaciones.css'

export default function FiltroHabitaciones({ onClear, onSearch }){
  return (
    <section className="glass filters">
      <h3>Filtros de Habitaciones</h3>
      <div className="grid">
        <div>
          <label>Categoría</label>
          <select className="select">
            <option value="">Todas</option>
            <option>Estándar</option>
            <option>Doble</option>
            <option>Suite</option>
          </select>
        </div>
        <div>
          <label>Tipo de Espacio</label>
          <select className="select">
            <option value="">Todos</option>
            <option>Individual</option>
            <option>Compartido</option>
            {/* Agrega más tipos si es necesario */}
          </select>
        </div>
        <div>
          <label>Cant. de Huéspedes</label>
          <input type="number" className="input" placeholder="Ej: 2" min="1" />
        </div>
      </div>
      <div className="grid one">
        <div>
          <label>Nro de Habitación</label>
          <input 
            type="text" 
            className="input" 
            placeholder="Buscar por número o nombre..." 
          />
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-gray" onClick={onClear}>Limpiar Filtros</button>
        <button className="btn btn-blue" onClick={onSearch}>Buscar Habitaciones</button>
      </div>
    </section>
  )
}