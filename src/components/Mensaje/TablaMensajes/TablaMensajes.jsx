import './TablaMensajes.css'

export default function TablaMensajes({ rows = [], onView, onReply }) {
  return (
    <section className="glass table-wrap">
      <div className="table-head">
        <h3>Mensajes</h3>
      </div>

      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>Nro de Mensaje</th>
              <th>Cliente</th>
              <th>Mensaje</th>
              <th>Fecha</th>
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
                  <td>{r.mensaje.substring(0, 50)}...</td>
                  <td>{r.fecha}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.estado === 'Contestado'
                          ? 'contestado'
                          : 'sin-responder'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>

                  <td className="actions">
                    {r.estado === 'Sin Responder' && (
                      <button className="btn btn-reply" onClick={() => onReply(r)}>
                        Contestar
                      </button>
                    )}

                    <button className="btn btn-primary" onClick={() => onView(r)}>
                      Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No hay mensajes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Mostrando <b>{rows.length}</b> de <b>{rows.length}</b> mensajes
        </span>
        <div className="pager">
          <button className="btn">Anterior</button>
          <button className="btn btn-primary">1</button>
          <button className="btn">Siguiente</button>
        </div>
      </div>
    </section>
  )
}
