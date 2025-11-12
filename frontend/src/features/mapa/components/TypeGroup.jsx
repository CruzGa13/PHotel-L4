import React, { useState } from 'react';
import TypeKPI from './TypeKPI';
import RoomRow from './RoomRow';
import styles from './TypeGroup.module.css';

const TypeGroup = ({ group, days, focalIndex, initiallyOpen = true, leftWidth = '260px', dayWidth, scrollLeft, fromDate }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  
  return (
    <div className={styles.group}>
      <div 
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
        style={{ gridTemplateColumns: `${leftWidth} 1fr` }}
      >
        <div className={styles.title}>
          <span className={styles.toggle}>{isOpen ? '▼' : '▸'}</span>
          <span>{group.tipoNombre} ({group.totalActivas})</span>
        </div>
        <div></div>
      </div>
      
      {isOpen && (
        <>
          <TypeKPI 
            kpiPorDia={group.kpiPorDia} 
            focalIndex={focalIndex}
            leftWidth={leftWidth}
            dayWidth={dayWidth}
            scrollLeft={scrollLeft}
          />
          {group.habitaciones.map((room) => (
            <RoomRow 
              key={room.id} 
              room={room} 
              days={days} 
              focalIndex={focalIndex}
              leftWidth={leftWidth}
              dayWidth={dayWidth}
              scrollLeft={scrollLeft}
              fromDate={fromDate}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default TypeGroup;
