import { useState } from 'react';
import styles from './TablaReserva.module.css';

export default function TablaReserva({ rows = [], onView }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calcular paginación
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = rows.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <section className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <h3>Listado de Reservas</h3>
      </div>

      <div className={styles.scrollX}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>N° Habitación</th>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.numeroHabitacion}</td>
                  <td>{r.huesped}</td>
                  <td>{r.nombreHabitacion}</td>
                  <td>{r.checkIn}</td>
                  <td>{r.checkOut}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        r.estado === 'Pendiente'
                          ? styles.pendiente
                          : r.estado === 'Confirmada'
                          ? styles.confirmada
                          : r.estado === 'CheckIn'
                          ? styles.checkin
                          : r.estado === 'CheckOut'
                          ? styles.checkout
                          : styles.cancelada
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className={styles.total}>{r.total}</td>
                  <td className={styles.actions}>
                    <button
                      className={styles.btnPrimary}
                      onClick={() => onView(r)}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: 'center', padding: '20px' }}
                >
                  No hay reservas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span>
          Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(endIndex, rows.length)}</b> de <b>{rows.length}</b> reservas
        </span>
        <div className={styles.pager}>
          <button 
            className={styles.btn} 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.btn} ${page === currentPage ? styles.btnActive : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button 
            className={styles.btn} 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}
