import React from 'react';
import styles from './TypeKPI.module.css';

const TypeKPI = ({ kpiPorDia, focalIndex, leftWidth = '260px', dayWidth, scrollLeft }) => {
  // Calcular posición del overlay de banda celeste
  const focalOverlayStyle = focalIndex >= 0 ? {
    left: `${focalIndex * dayWidth - scrollLeft}px`,
    width: `${dayWidth}px`
  } : null;
  
  return (
    <div className={styles.kpiRow} style={{ gridTemplateColumns: `${leftWidth} 1fr` }}>
      <div className={styles.label}>
        KPIs
      </div>
      <div className={styles.kpiContainer}>
        {kpiPorDia.map((kpi, idx) => (
          <div
            key={idx}
            className={styles.kpiCell}
            title={`Disponibles: ${kpi.disponibles} • ADR: $${kpi.adr.toFixed(2)}`}
          >
            <div className={styles.disponibles}>{kpi.disponibles}</div>
            <div className={styles.adr}>${kpi.adr.toFixed(2)}</div>
          </div>
        ))}
        {/* Overlay para banda celeste */}
        {focalOverlayStyle && (
          <div className={styles.focalOverlay} style={focalOverlayStyle} />
        )}
      </div>
    </div>
  );
};

export default TypeKPI;
