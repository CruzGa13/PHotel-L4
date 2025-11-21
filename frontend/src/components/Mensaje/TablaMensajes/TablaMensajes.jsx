import { useState, useMemo } from 'react';
import styles from './TablaMensajes.module.css';

export default function TablaMensajes({ mensajes = [], onVerDetalle, onMarcarRespondido }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [marcandoId, setMarcandoId] = useState(null);
  const itemsPerPage = 10;

  // Función para ordenar
  const handleSort = (field) => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, invertir dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, empezar con descendente
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Volver a página 1 al ordenar
  };

  // Mensajes ordenados
  const mensajesOrdenados = useMemo(() => {
    const sorted = [...mensajes].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Manejo especial para fechas
      if (sortField === 'fecha') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Manejo especial para strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [mensajes, sortField, sortDirection]);

  // Calcular paginación con mensajes ordenados
  const totalPages = Math.ceil(mensajesOrdenados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMensajes = mensajesOrdenados.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Formatear fecha
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener emoji para canal
  const getCanalIcon = (canal) => {
    const iconos = {
      Web: '🌐',
      Email: '📧',
      WhatsApp: '💬'
    };
    return iconos[canal] || '📨';
  };

  // Componente para header ordenable
  const SortableHeader = ({ field, children }) => (
    <th 
      onClick={() => handleSort(field)}
      className={styles.sortableHeader}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {children}
        {sortField === field && (
          <span style={{ fontSize: '12px' }}>
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <section className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <h3>📬 Bandeja de Mensajes</h3>
      </div>

      <div className={styles.scrollX}>
        <table className={styles.table}>
          <thead>
            <tr>
              <SortableHeader field="id">ID</SortableHeader>
              <SortableHeader field="asunto">Asunto</SortableHeader>
              <SortableHeader field="remitente">Remitente</SortableHeader>
              <SortableHeader field="canal">Canal</SortableHeader>
              <SortableHeader field="fecha">Fecha</SortableHeader>
              <SortableHeader field="estado">Estado</SortableHeader>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentMensajes.length > 0 ? (
              currentMensajes.map((m) => (
                <tr key={m.id} className={m.estado === 'Pendiente' ? styles.rowPendiente : ''}>
                  <td className={styles.idCell}>#{m.id}</td>
                  <td className={styles.asuntoCell}>
                    <div className={styles.asuntoWrapper}>
                      <span className={styles.asunto}>{m.asunto}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.remitenteCell}>
                      <div className={styles.nombre}>{m.remitente}</div>
                      <div className={styles.email}>{m.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.canalBadge}>
                      <span className={styles.canalIcon}>{getCanalIcon(m.canal)}</span>
                      {m.canal}
                    </span>
                  </td>
                  <td className={styles.fechaCell}>{formatearFecha(m.fecha)}</td>
                  <td>
                    <span
                      className={`${styles.estadoBadge} ${
                        m.estado === 'Pendiente'
                          ? styles.estadoPendiente
                          : styles.estadoRespondido
                      }`}
                    >
                      {m.estado === 'Pendiente' ? '⏳' : '✅'} {m.estado}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button
                      className={styles.btnVer}
                      onClick={() => onVerDetalle(m)}
                      title="Ver detalle completo"
                    >
                      👁️ Ver
                    </button>
                    {m.estado === 'Pendiente' && (
                      <button
                        className={styles.btnResponder}
                        onClick={async () => {
                          setMarcandoId(m.id);
                          await onMarcarRespondido(m);
                          setMarcandoId(null);
                        }}
                        disabled={marcandoId === m.id}
                        title="Marcar como respondido"
                      >
                        {marcandoId === m.id ? '⏳ Marcando...' : '✓ Marcar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📭</div>
                  <p>No hay mensajes que coincidan con los filtros</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mensajes.length > 0 && (
        <div className={styles.pagination}>
          <span>
            Mostrando <b>{startIndex + 1}</b> a <b>{Math.min(endIndex, mensajesOrdenados.length)}</b> de <b>{mensajesOrdenados.length}</b> mensajes
          </span>
          <div className={styles.pager}>
            <button 
              className={styles.btn} 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`${styles.btn} ${pageNum === currentPage ? styles.btnActive : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              className={styles.btn} 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
