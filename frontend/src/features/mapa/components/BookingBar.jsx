import React, { useMemo } from 'react';
import styles from './BookingBar.module.css';

const BookingBar = ({ bar, daysRange, dayWidth, fromDate }) => {
  // Calcular posición y ancho en píxeles basado en fromDate
  const barStyle = useMemo(() => {
    if (!daysRange || daysRange.length === 0 || !fromDate || !dayWidth) return null;
    
    // Convertir fechas a objetos Date para comparación
    const rangeStartDate = new Date(daysRange[0].date);
    const rangeEndDate = new Date(daysRange[daysRange.length - 1].date);
    const barStartDate = new Date(bar.desde);
    const barEndDate = new Date(bar.hasta);
    
    // Si la barra está completamente fuera del rango, no mostrar
    if (barEndDate < rangeStartDate || barStartDate > rangeEndDate) {
      return null;
    }
    
    // Calcular días desde el inicio del rango (fromDate)
    const rangeStart = new Date(fromDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Fecha efectiva de inicio (clamped al rango visible)
    const effectiveStart = barStartDate < rangeStartDate ? rangeStartDate : barStartDate;
    // Fecha efectiva de fin (clamped al rango visible)
    const effectiveEnd = barEndDate > rangeEndDate ? rangeEndDate : barEndDate;
    
    // Calcular diferencia en días desde el inicio del rango
    const daysFromStart = Math.floor((effectiveStart - rangeStart) / msPerDay);
    const daysFromEnd = Math.floor((effectiveEnd - rangeStart) / msPerDay);
    
    // Duración en días (incluye día de inicio y fin)
    const durationDays = daysFromEnd - daysFromStart + 1;
    
    // Posición y ancho en píxeles
    const left = daysFromStart * dayWidth;
    const width = durationDays * dayWidth;
    
    return { left, width };
  }, [bar.desde, bar.hasta, daysRange, dayWidth, fromDate]);
  
  if (!barStyle) return null;
  
  const className = bar.kind === 'reserva' 
    ? (bar.estadoReserva === 'Confirmada' ? styles.confirmada : styles.enCurso)
    : styles.bloqueo;
  
  const title = bar.kind === 'reserva'
    ? `${bar.huespedNombre || bar.label}\n${bar.desde} - ${bar.hasta}\nEstado: ${bar.estadoReserva}${bar.montoPendiente > 0 ? `\nPendiente: $${bar.montoPendiente}` : ''}`
    : `${bar.label}\n${bar.desde} - ${bar.hasta}`;
  
  return (
    <div 
      className={`${styles.bar} ${className}`}
      style={{
        position: 'absolute',
        left: `${barStyle.left}px`,
        width: `${barStyle.width}px`,
        top: '50%',
        transform: 'translateY(-50%)'
      }}
      title={title}
      tabIndex={0}
    >
      <span className={styles.label}>{bar.label}</span>
    </div>
  );
};

export default BookingBar;
