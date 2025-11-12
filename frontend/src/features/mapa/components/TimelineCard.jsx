import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimeControls from './TimeControls';
import DaysHeader from './DaysHeader';
import TypeGroup from './TypeGroup';
import styles from './TimelineCard.module.css';

const TimelineCard = ({ from, days, focalIndex, data, onPrev, onToday, onNext }) => {
  const scrollAreaRef = useRef(null);
  const headerRef = useRef(null);
  const [dayWidth, setDayWidth] = useState(80); // Ancho por defecto
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Obtener mes y año para el label
  const getMonthLabel = () => {
    if (!days || days.length === 0) return '';
    
    const firstDate = new Date(days[0].date);
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    
    return `${months[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
  };
  
  const leftWidth = '260px';
  
  // Medir dayWidth desde el DOM
  const measureDayWidth = useCallback(() => {
    if (scrollAreaRef.current && days.length > 0) {
      const firstRow = scrollAreaRef.current.querySelector('[data-timeline-grid]');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('[data-day-cell]');
        if (cells.length > 0) {
          const width = cells[0].offsetWidth;
          setDayWidth(width);
        }
      }
    }
  }, [days.length]);
  
  // Medir dayWidth al montar y cuando cambien los días
  useEffect(() => {
    // Timeout para asegurar que el DOM esté renderizado
    const timer = setTimeout(measureDayWidth, 0);
    return () => clearTimeout(timer);
  }, [measureDayWidth, days.length, from]);
  
  // ResizeObserver para recalcular si cambia el tamaño
  useEffect(() => {
    if (!scrollAreaRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      measureDayWidth();
    });
    
    resizeObserver.observe(scrollAreaRef.current);
    return () => resizeObserver.disconnect();
  }, [measureDayWidth]);
  
  // Sincronizar scroll horizontal entre header y body
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    
    const handleScroll = (e) => {
      const sl = e.target.scrollLeft;
      setScrollLeft(sl);
      // Sincronizar header si existe
      if (headerRef.current) {
        headerRef.current.scrollLeft = sl;
      }
    };
    
    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className={styles.card}>
      <TimeControls 
        leftWidth={leftWidth}
        onPrev={onPrev}
        onToday={onToday}
        onNext={onNext}
        monthLabel={getMonthLabel()}
      />
      
      <DaysHeader 
        ref={headerRef}
        days={days} 
        focalIndex={focalIndex}
        leftWidth={leftWidth}
        dayWidth={dayWidth}
        scrollLeft={scrollLeft}
      />
      
      <div ref={scrollAreaRef} className={styles.scrollArea}>
        {data.grupos.map((group) => (
          <TypeGroup 
            key={group.tipoId} 
            group={group} 
            days={days}
            focalIndex={focalIndex}
            leftWidth={leftWidth}
            dayWidth={dayWidth}
            scrollLeft={scrollLeft}
            fromDate={from}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineCard;
