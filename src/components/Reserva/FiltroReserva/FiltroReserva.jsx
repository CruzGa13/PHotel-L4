import './FiltroReserva.css'

export default function Filters({ onClear, onSearch }){
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
          <label>Categoría</label>
          <select className="select">
            <option value="">Todos</option>
            <option>Ingreso</option>
            <option>Egreso</option>
          </select>
        </div>
        <div>
          <label>Tipo de Espacio</label>
          <select className="select">
            <option value="">Todos los depósitos</option>
          </select>
        </div>
      </div>
      <div className="grid one">
        <div>
          <label>Nro de Habitación</label>
          <select className="select">
            <option value="">Todos</option>
            <option>Transferencia entre depósitos</option>
            <option>Compra de inventario</option>
            <option>Venta de inventario</option>
            <option>Ajuste de stock</option>
          </select>
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-gray" onClick={onClear}>Limpiar Filtros</button>
        <button className="btn btn-blue" onClick={onSearch}>Buscar Movimientos</button>
      </div>
    </section>
  )
}
