import React from 'react';
import styles from './TimeControls.module.css';

const TimeControls = ({ leftWidth = '260px', onPrev, onToday, onNext, monthLabel }) => {
  return (
    <div className={styles.controls} style={{ gridTemplateColumns: `${leftWidth} 1fr` }}>
      <div className={styles.left}>
        <button 
          className={styles.btnNav} 
          onClick={onPrev}
          aria-label="Ir al día anterior"
        >
          ←
        </button>
        <button 
          className={styles.btnToday} 
          onClick={onToday}
          aria-label="Volver a hoy"
        >
          HOY
        </button>
        <button 
          className={styles.btnNav} 
          onClick={onNext}
          aria-label="Ir al día siguiente"
        >
          →
        </button>
      </div>
      <div className={styles.right}>
        <span className={styles.monthLabel}>{monthLabel}</span>
      </div>
    </div>
  );
};

export default TimeControls;
