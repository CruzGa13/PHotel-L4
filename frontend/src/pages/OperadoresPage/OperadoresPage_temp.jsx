import { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaTrash, FaSort, FaSortUp, FaSortDown, FaCheckCircle, FaTimesCircle, FaUserClock } from 'react-icons/fa';
import styles from './OperadoresPage.module.css';
import { fetchOperadores } from '../../services/operadoresApi';

export default function OperadoresPage() {
  // Estados para datos de la API
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para paginaciÃ³n
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estados para ordenamiento
  const [sortBy, setSortBy] = useState('fechaAlta');
  const [order, setOrder] = useState('desc'); // Por defecto descendente (mÃ¡s nuevo primero)
  
  // Cargar operadores desde la API
  useEffect(() => {
    const loadOperadores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchOperadores({
          page,
          pageSize,
          sortBy,
          order
        });
        
        setOperadores(response.items);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error al cargar operadores:', err);
        setError(err.message || 'Error al cargar operadores');
        setOperadores([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOperadores();
  }, [page, pageSize, sortBy, order]);
  
  // Calcular estadÃ­sticas
  // TODO: En el futuro, obtener estos conteos desde un endpoint dedicado del backend
  // que devuelva estadÃ­sticas globales (no solo de la pÃ¡gina actual)
  const estadisticas = {
    total: total, // Total global desde la API
    // Activos e Inactivos se calculan de la pÃ¡gina actual
    // TODO: Implementar endpoint /api/operadores/stats para obtener conteos globales reales
    activos: operadores.filter(op => op.estado === true).length,
    inactivos: operadores.filter(op => op.estado === false).length
  };
  
  // FunciÃ³n para manejar ordenamiento
  const handleSort = (field) => {
    if (sortBy === field) {
      // Alternar direcciÃ³n si ya estÃ¡ ordenado por este campo
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, empezar con ascendente excepto para fecha
      setSortBy(field);
      setOrder(field === 'fechaAlta' ? 'desc' : 'asc');
    }
    setPage(1); // Volver a la primera pÃ¡gina al ordenar
  };
  
  // Handlers de paginaciÃ³n
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  
  // Formatear fecha
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return {
      fecha: fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      hora: fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };
  
  // Obtener ID corto (primeros 8 caracteres)
  const getIdCorto = (id) => {
    return id.substring(0, 8);
  };
  
  // Handlers de acciones
  // TODO: Conectar estas acciones con la API (PUT, DELETE, etc.)
  const handleEditar = (operador) => {
    console.log('Editar operador:', operador.id);
    // TODO: Abrir modal de ediciÃ³n y llamar a updateOperador()
  };
  
  const handleVerDetalle = (operador) => {
    console.log('Ver detalle operador:', operador.id);
    // TODO: Abrir modal de detalle y llamar a getOperadorById()
  };
  
  const handleVerActividad = (operador) => {
    console.log('Ver actividad/historial operador:', operador.id);
    // TODO: Navegar a pÃ¡gina de actividad o abrir modal
  };
  
  const handleEliminar = (operador) => {
    console.log('Eliminar operador:', operador.id);
    // TODO: Mostrar confirmaciÃ³n y llamar a deleteOperador()
  };
  
  // Componente para header ordenable
  const SortableHeader = ({ field, children }) => {
    const isActive = sortBy === field;
    
    return (
      <th 
        onClick={() => handleSort(field)}
        className={styles.sortableHeader}
        title={`Ordenar por ${children}`}
      >
        <div className={styles.headerContent}>
          {children}
          <span className={styles.sortIcon}>
            {!isActive && <FaSort />}
            {isActive && order === 'asc' && <FaSortUp />}
            {isActive && order === 'desc' && <FaSortDown />}
          </span>
        </div>
      </th>
    );
  };
  
  return (
    <div className={styles.page}>
      <main className={styles.containerMain}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Inicio</span>
          <span className={styles.sep}>â€º</span>
          <span>Operador</span>
          <span className={styles.sep}>â€º</span>
          <span className={styles.pink}>Operadores</span>
        </div>
        
        {/* Cabecera */}
        <div className={styles.headTop}>
          <div>
            <h2 className={styles.gradientText}>ðŸ‘¥ Operadores</h2>
            <p className={styles.muted}>
              GestiÃ³n y listado de operadores del sistema
            </p>
          </div>
        </div>
        
        {/* Tarjetas de resumen */}
        <section className={styles.cards}>
          {/* Card Total */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#8b4513',
              '--grad-end': '#654321'
            }}
          >
            <div className={styles.cardContent}>
              <p>Total de Operadores</p>
              <h3 className={styles.value}>{estadisticas.total}</h3>
            </div>
            <div className={styles.cardIcon}>ðŸ‘¥</div>
          </div>
          
          {/* Card Activos */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#d2691e',
              '--grad-end': '#a0522d',
              animationDelay: '.05s'
            }}
          >
            <div className={styles.cardContent}>
              <p>Activos</p>
              <h3 className={styles.value}>{estadisticas.activos}</h3>
            </div>
            <div className={styles.cardIcon}><FaCheckCircle /></div>
          </div>
          
          {/* Card Inactivos */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#cd853f',
              '--grad-end': '#b8860b',
              animationDelay: '.1s'
            }}
          >
            <div className={styles.cardContent}>
              <p>Inactivos</p>
              <h3 className={styles.value}>{estadisticas.inactivos}</h3>
            </div>
            <div className={styles.cardIcon}><FaTimesCircle /></div>
          </div>
        </section>
        
        {/* Mensaje de error */}
        {error && (
          <div className={styles.errorMessage}>
            âš ï¸ {error}
          </div>
        )}
        
        {/* Tabla de operadores */}
        <section className={styles.tableWrap}>
          <div className={styles.tableHead}>
            <h3>ðŸ“‹ Listado de Operadores</h3>
            <span className={styles.tableInfo}>
              {loading ? (
                'Cargando...'
              ) : (
                `Mostrando ${operadores.length > 0 ? ((page - 1) * pageSize + 1) : 0} - ${Math.min(page * pageSize, total)} de ${total}`
              )}
            </span>
          </div>
          
          <div className={styles.scrollX}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortableHeader field="nombre">Nombre</SortableHeader>
                  <th>Contacto</th>
                  <SortableHeader field="estado">Estado</SortableHeader>
                  <SortableHeader field="fechaAlta">Fecha de Registro</SortableHeader>
                  <th>Acciones</th>
                </tr>
              </thead>
              
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className={styles.loadingState}>
                      <div className={styles.spinner}></div>
                      <p>Cargando operadores...</p>
                    </td>
                  </tr>
                ) : operadores.length > 0 ? (
                  operadores.map((operador) => {
                    const { fecha, hora } = formatearFecha(operador.fechaAlta);
                    const idCorto = getIdCorto(operador.id);
                    
                    return (
                      <tr key={operador.id}>
                        {/* Columna Nombre */}
                        <td>
                          <div className={styles.nombreCell}>
                            <div className={styles.nombrePrincipal} title={operador.id}>
                              {operador.nombreCompleto || `${operador.nombre} ${operador.apellido || ''}`}
                            </div>
                            <div className={styles.nombreSecundario}>
                              ID: {idCorto}
                            </div>
                          </div>
                        </td>
                        
                        {/* Columna Contacto */}
                        <td>
                          <div className={styles.contactoCell}>
                            <div className={styles.contactoPrincipal}>
                              {operador.email || 'Sin email'}
                              {/* TODO: Email vendrÃ¡ de Supabase en el futuro */}
                            </div>
                            <div className={styles.contactoSecundario}>
                              {operador.telefono || 'Sin telÃ©fono'}
                            </div>
                          </div>
                        </td>
                        
                        {/* Columna Estado */}
                        <td>
                          <span
                            className={`${styles.estadoBadge} ${
                              operador.estado ? styles.estadoActivo : styles.estadoInactivo
                            }`}
                          >
                            {operador.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        
                        {/* Columna Fecha de Registro */}
                        <td>
                          <div className={styles.fechaCell}>
                            <div className={styles.fechaPrincipal}>{fecha}</div>
                            <div className={styles.fechaSecundaria}>{hora}</div>
                          </div>
                        </td>
                        
                        {/* Columna Acciones */}
                        <td className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.btnEditar}`}
                            onClick={() => handleEditar(operador)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.btnVer}`}
                            onClick={() => handleVerDetalle(operador)}
                            title="Ver detalle"
                          >
                            <FaEye />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.btnActividad}`}
                            onClick={() => handleVerActividad(operador)}
                            title="Ver actividad"
                          >
                            <FaUserClock />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.btnEliminar}`}
                            onClick={() => handleEliminar(operador)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      <div className={styles.emptyIcon}>ðŸ‘¥</div>
                      <p>No se encontraron operadores</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* PaginaciÃ³n */}
          {!loading && total > 0 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                PÃ¡gina {page} de {totalPages}
              </span>
              <div className={styles.paginationControls}>
                <button
                  className={styles.btnPagination}
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  â† Anterior
                </button>
                <button
                  className={styles.btnPagination}
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Siguiente â†’
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
