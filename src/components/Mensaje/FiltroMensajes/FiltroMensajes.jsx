import './FiltroMensajes.css'

export default function FiltroMensaje({ onClear, onSearch }) {
  return (
    <section className="glass filters">
      <h3>Filtros de Búsqueda</h3>
      <div className="grid">
        <div>
          <label>Fecha Desde</label>
          <input type="date" className="input" />
        </div>
        <div>
          <label>Fecha Hasta</label>
          <input type="date" className="input" />
        </div>
        <div>
          <label>Cliente</label>
          {/* --- CAMBIADO: type="date" a type="text" --- */}
          <input
            type="text"
            placeholder="Nombre o email del cliente..."
            className="input"
          />
        </div>
        <div>
          <label>Estado</label>
          <select className="select">
            <option value="">Todos</option>
            <option>Contestado</option>
            <option>Sin Responder</option>
          </select>
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-gray" onClick={onClear}>
          Limpiar Filtros
        </button>
        <button className="btn btn-blue" onClick={onSearch}>
          Buscar Mensajes
        </button>
      </div>
    </section>
  )
}