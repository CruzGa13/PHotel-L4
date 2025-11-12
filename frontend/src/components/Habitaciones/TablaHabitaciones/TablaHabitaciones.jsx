import React from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import StateBadge from "../StateBadge/StateBadge";
import "./TablaHabitaciones.css"; 

export default function TablaHabitaciones({ 
  rows = [], 
  loading = false, 
  error = null, 
  page = 1,
  pageSize = 10,
  total = 0,
  totalPages = 0,
  orderBy = 'numero',
  dir = 'asc',
  onView,
  onNextPage,
  onPrevPage,
  onSort,
}) {
  // Calcular rango de elementos mostrados
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Función para renderizar el icono de ordenamiento
  const renderSortIcon = (column) => {
    if (orderBy !== column) {
      return <FaSort className="sort-icon inactive" />;
    }
    return dir === 'asc' ? (
      <FaSortUp className="sort-icon active" />
    ) : (
      <FaSortDown className="sort-icon active" />
    );
  };
  return (
    <section className="glass table-wrap">
      <div className="table-head">
        <h3>Habitaciones</h3>
      </div>

      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable" 
                onClick={() => onSort('numero')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  N° Habitación
                  {renderSortIcon('numero')}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => onSort('piso')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Piso
                  {renderSortIcon('piso')}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => onSort('tipo')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Tipo
                  {renderSortIcon('tipo')}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => onSort('categoria')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Categoría
                  {renderSortIcon('categoria')}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => onSort('ocupacion')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Ocupación
                  {renderSortIcon('ocupacion')}
                </div>
              </th>
              <th 
                className="sortable" 
                onClick={() => onSort('capacidad')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Capacidad
                  {renderSortIcon('capacidad')}
                </div>
              </th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: '#6b7280' }}>Cargando habitaciones...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: '#dc2626' }}>⚠️ {error}</p>
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((hab) => (
                <tr key={hab.id}>
                  <td><strong>#{hab.numero}</strong></td>
                  <td>{hab.piso}°</td>
                  <td>{hab.tipoHabitacion?.nombre || '-'}</td>
                  <td>{hab.tipoHabitacion?.categoria?.nombre || '-'}</td>
                  <td>{hab.tipoHabitacion?.ocupacion?.nombre || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {hab.tipoHabitacion?.ocupacion?.capacidad || '-'}
                  </td>
                  <td>
                    <StateBadge estado={hab.estado} />
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => onView(hab)}
                    >
                      Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: '#6b7280' }}>No hay habitaciones registradas</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && rows.length > 0 && (
        <div className="pagination">
          <span>
            Mostrando <b>{start}</b> a <b>{end}</b> de <b>{total}</b> habitaciones
          </span>
          <div className="pager">
            <button 
              className="btn" 
              onClick={onPrevPage}
              disabled={page === 1}
              style={{
                opacity: page === 1 ? 0.5 : 1,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Anterior
            </button>
            <button className="btn btn-primary" disabled>
              {page} / {totalPages}
            </button>
            <button 
              className="btn"
              onClick={onNextPage}
              disabled={page >= totalPages}
              style={{
                opacity: page >= totalPages ? 0.5 : 1,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}