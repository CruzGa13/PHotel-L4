import React from "react";
import "./TablaHabitaciones.css"; 
export default function TablaHabitaciones({ rows = [], onView }) {
  return (
    <section className="glass table-wrap">
      <div className="table-head">
        <h3>Habitaciones</h3>
      </div>

      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>N° Habitación</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Tipo Espacio</th>
              <th>Huéspedes</th>
              <th>Fecha y hora de Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.id}>
                  {/* Asumiendo que 'id' o 'nro_habitacion' es el número */}
                  <td>#{r.nro_habitacion || r.id}</td>
                  <td>{r.nombre}</td>
                  <td>{r.categoria}</td>
                  <td>{r.tipo_espacio}</td>
                  <td>{r.cantidad_huespedes}</td>
                  <td>{r.fecha_registro}</td>

                  {/* Celda añadida para el estado */}
                  <td>
                    <span
                      className={`badge ${
                        r.estado === "Activa"
                          ? "confirmada" // Usamos la clase 'confirmada' (verde) para 'Activa'
                          : "cancelada"   // Usamos la clase 'cancelada' (rojo) para 'Inactiva'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>

                  <td className="actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => onView(r)}
                    >
                      Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* Colspan actualizado a 8 */}
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No hay habitaciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Mostrando <b>{rows.length}</b> de <b>{rows.length}</b> habitaciones
        </span>
        <div className="pager">
          <button className="btn">Anterior</button>
          <button className="btn btn-primary">1</button>
          <button className="btn">Siguiente</button>
        </div>
      </div>
    </section>
  );
}