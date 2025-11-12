import React, { useState, useMemo } from 'react';
import TimelineCard from './components/TimelineCard';
import Legend from './components/Legend';
import { buildMockMapa } from './data/mockMapa';
import styles from './MapaPage.module.css';

const MapaPage = () => {
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 2); // Empezar 2 días antes
    return today.toISOString().split('T')[0];
  });
  
  const [daysCount] = useState(14);
  
  // Generar datos mock
  const mapaData = useMemo(() => {
    return buildMockMapa(fromDate, daysCount);
  }, [fromDate, daysCount]);
  
  // Navegación
  const handlePrev = () => {
    const newDate = new Date(fromDate);
    newDate.setDate(newDate.getDate() - 1);
    setFromDate(newDate.toISOString().split('T')[0]);
  };
  
  const handleNext = () => {
    const newDate = new Date(fromDate);
    newDate.setDate(newDate.getDate() + 1);
    setFromDate(newDate.toISOString().split('T')[0]);
  };
  
  const handleToday = () => {
    const today = new Date();
    today.setDate(today.getDate() - 2);
    setFromDate(today.toISOString().split('T')[0]);
  };
  
  return (
    <div className={styles.pageBg}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Mapa de Habitaciones</h1>
          <p className={styles.subtitle}>Disponibilidad y ocupación por día</p>
        </div>
        
        <TimelineCard 
          from={fromDate}
          days={mapaData.days}
          focalIndex={mapaData.focalDayIndex}
          data={mapaData}
          onPrev={handlePrev}
          onToday={handleToday}
          onNext={handleNext}
        />
        
        <Legend />
      </div>
    </div>
  );
};

export default MapaPage;
