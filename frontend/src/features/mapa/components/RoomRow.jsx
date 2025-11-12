import React, { useState } from 'react';
import BookingBar from './BookingBar';
import styles from './RoomRow.module.css';

const RoomRow = ({ room, days, focalIndex, leftWidth = '260px', dayWidth, scrollLeft, fromDate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleMenuClick = (action) => {
    console.log(`Acción: ${action} - Habitación ${room.numero}`);
    setMenuOpen(false);
  };
  
  // Calcular posición del overlay de banda celeste
  const focalOverlayStyle = focalIndex >= 0 ? {
    left: `${focalIndex * dayWidth - scrollLeft}px`,
    width: `${dayWidth}px`
  } : null;
  
  return (
    <div className={styles.row} style={{ gridTemplateColumns: `${leftWidth} 1fr` }}>
      <div className={styles.roomInfo}>
        <span className={styles.numero}>{room.numero}</span>
        {room.cerrada && <span className={styles.pillCerrada}>CERRADA</span>}
        <div className={styles.menuContainer}>
          <button 
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Acciones de habitación"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              <button onClick={() => handleMenuClick('toggle')}>
                {room.cerrada ? 'Abrir' : 'Cerrar'} habitación
              </button>
              <button onClick={() => handleMenuClick('info')}>
                Info de habitación
              </button>
            </div>
          )}
        </div>
      </div>
      <div className={styles.timeline} data-timeline-grid>
        {days.map((day, idx) => (
          <div
            key={day.date}
            className={styles.cell}
            data-day-cell
          />
        ))}
        {/* Overlay para banda celeste */}
        {focalOverlayStyle && (
          <div className={styles.focalOverlay} style={focalOverlayStyle} />
        )}
        {/* Barras de reserva/bloqueo */}
        {room.barras.map((bar, idx) => (
          <BookingBar 
            key={idx} 
            bar={bar} 
            daysRange={days}
            dayWidth={dayWidth}
            fromDate={fromDate}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomRow;
