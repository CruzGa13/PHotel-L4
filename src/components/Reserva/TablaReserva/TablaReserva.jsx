import React from "react";
import "./TablaReserva.css";

export default function TablaReserva({ rows = [], onView }) {
  return (
    <section className="glass table-wrap">
      <div className="table-head">
        <h3>Reservas</h3>
      </div>

      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>N° Reserva</th>
              <th>Cliente</th>
              <th>Habitación</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.cliente}</td>
                  <td>{r.habitacion}</td>
                  <td>{r.checkIn}</td>
                  <td>{r.checkOut}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.estado === "Confirmada"
                          ? "confirmada"
                          : r.estado === "Pendiente"
                          ? "pendiente"
                          : "cancelada"
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
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No hay reservas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Mostrando <b>{rows.length}</b> de <b>{rows.length}</b> reservas
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
