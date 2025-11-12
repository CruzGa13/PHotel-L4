import React from 'react';
import styles from './Legend.module.css';

const Legend = () => {
  return (
    <div className={styles.legend}>
      <div className={styles.item}>
        <span className={`${styles.color} ${styles.confirmada}`}></span>
        <span>Verde = Confirmada</span>
      </div>
      <div className={styles.item}>
        <span className={`${styles.color} ${styles.enCurso}`}></span>
        <span>Celeste = En curso</span>
      </div>
      <div className={styles.item}>
        <span className={`${styles.color} ${styles.bloqueo}`}></span>
        <span>Rojo = Bloqueo/Mantto</span>
      </div>
    </div>
  );
};

export default Legend;
