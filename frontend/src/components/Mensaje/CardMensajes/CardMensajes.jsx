import styles from './CardMensajes.module.css';

export default function CardMensajes({ estadisticas }) {
  const {
    total = 0,
    pendientes = 0,
    respondidos = 0,
    ultimas24h = 0
  } = estadisticas || {};

  return (
    <section className={styles.cards}>
      {/* Card Total */}
      <div
        className={`${styles.card} ${styles.fadeIn}`}
        style={{
          '--grad-start': '#3b82f6',
          '--grad-end': '#2563eb'
        }}
      >
        <div className={styles.cardContent}>
          <p>Total Mensajes</p>
          <h3 className={styles.value}>{total}</h3>
        </div>
        <div className={styles.cardIcon}>📨</div>
      </div>

      {/* Card Pendientes */}
      <div
        className={`${styles.card} ${styles.fadeIn}`}
        style={{
          '--grad-start': '#f59e0b',
          '--grad-end': '#d97706',
          animationDelay: '.05s'
        }}
      >
        <div className={styles.cardContent}>
          <p>Pendientes</p>
          <h3 className={styles.value}>{pendientes}</h3>
        </div>
        <div className={styles.cardIcon}>⏳</div>
      </div>

      {/* Card Respondidos */}
      <div
        className={`${styles.card} ${styles.fadeIn}`}
        style={{
          '--grad-start': '#10b981',
          '--grad-end': '#059669',
          animationDelay: '.1s'
        }}
      >
        <div className={styles.cardContent}>
          <p>Respondidos</p>
          <h3 className={styles.value}>{respondidos}</h3>
        </div>
        <div className={styles.cardIcon}>✅</div>
      </div>

      {/* Card Últimas 24h */}
      <div
        className={`${styles.card} ${styles.fadeIn}`}
        style={{
          '--grad-start': '#8b5cf6',
          '--grad-end': '#7c3aed',
          animationDelay: '.15s'
        }}
      >
        <div className={styles.cardContent}>
          <p>Últimas 24h</p>
          <h3 className={styles.value}>{ultimas24h}</h3>
        </div>
        <div className={styles.cardIcon}>🕒</div>
      </div>
    </section>
  );
}
