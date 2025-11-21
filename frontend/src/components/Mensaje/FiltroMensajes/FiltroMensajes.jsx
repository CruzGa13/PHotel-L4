import styles from './FiltroMensajes.module.css';

export default function FiltroMensajes({ filtros, onFiltroChange, onLimpiar }) {
  const handleChange = (campo, valor) => {
    onFiltroChange({ ...filtros, [campo]: valor });
  };

  return (
    <section className={styles.filtrosWrap}>
      <div className={styles.filtrosHeader}>
        <h3>🔍 Filtros de Búsqueda</h3>
      </div>
      
      <div className={styles.filtrosBody}>
        {/* Fila 1: Búsqueda de texto */}
        <div className={styles.gridFull}>
          <div className={styles.inputGroup}>
            <label htmlFor="texto">Búsqueda general</label>
            <input
              id="texto"
              type="text"
              className={styles.input}
              placeholder="Buscar por asunto, remitente, email o contenido..."
              value={filtros.texto || ''}
              onChange={(e) => handleChange('texto', e.target.value)}
            />
          </div>
        </div>

        {/* Fila 2: Estado, Canal, Prioridad */}
        <div className={styles.grid3}>
          <div className={styles.inputGroup}>
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              className={styles.select}
              value={filtros.estado || 'Todos'}
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Pendiente">⏳ Pendiente</option>
              <option value="Respondido">✅ Respondido</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="canal">Canal</label>
            <select
              id="canal"
              className={styles.select}
              value={filtros.canal || 'Todos'}
              onChange={(e) => handleChange('canal', e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Web">🌐 Web</option>
              <option value="Email">📧 Email</option>
              <option value="WhatsApp">💬 WhatsApp</option>
            </select>
          </div>
        </div>

        {/* Fila 3: Rango de fechas */}
        <div className={styles.grid2}>
          <div className={styles.inputGroup}>
            <label htmlFor="fechaDesde">Desde</label>
            <input
              id="fechaDesde"
              type="date"
              className={styles.input}
              value={filtros.fechaDesde || ''}
              onChange={(e) => handleChange('fechaDesde', e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="fechaHasta">Hasta</label>
            <input
              id="fechaHasta"
              type="date"
              className={styles.input}
              value={filtros.fechaHasta || ''}
              onChange={(e) => handleChange('fechaHasta', e.target.value)}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button
            className={styles.btnLimpiar}
            onClick={onLimpiar}
            type="button"
          >
            🗑️ Limpiar Filtros
          </button>
          <div className={styles.resultadosInfo}>
            {Object.values(filtros).some(v => v && v !== 'Todos') && (
              <span className={styles.badge}>
                Filtros activos
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
