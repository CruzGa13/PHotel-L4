import React, { forwardRef } from 'react';
import styles from './DaysHeader.module.css';

const DaysHeader = forwardRef(({ days, focalIndex, leftWidth = '260px', dayWidth, scrollLeft }, ref) => {
  // Calcular posición del overlay de banda celeste
  const focalOverlayStyle = focalIndex >= 0 ? {
    left: `${focalIndex * dayWidth - scrollLeft}px`,
    width: `${dayWidth}px`
  } : null;
  
  return (
    <div className={styles.headerRow} style={{ gridTemplateColumns: `${leftWidth} 1fr` }}>
      <div className={styles.labelCell}>
        <span>Habitación</span>
      </div>
      <div className={styles.daysContainer} ref={ref}>
        {days.map((day, idx) => (
          <div
            key={day.date}
            className={`${styles.dayCell} ${day.monthBreak ? styles.monthBreak : ''}`}
            data-day-cell
          >
            <div className={styles.dayLabel}>{day.labelShort}</div>
          </div>
        ))}
        {/* Overlay para banda celeste */}
        {focalOverlayStyle && (
          <div className={styles.focalOverlay} style={focalOverlayStyle} />
        )}
      </div>
    </div>
  );
});

DaysHeader.displayName = 'DaysHeader';

export default DaysHeader;
