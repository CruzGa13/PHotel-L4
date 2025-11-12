/**
 * Generador de datos mock para el Mapa de Habitaciones
 * @param {string} fromISO - Fecha inicial en formato ISO (YYYY-MM-DD)
 * @param {number} days - Cantidad de días a mostrar
 * @returns {Object} Objeto con days, grupos, focalDayIndex
 */
export function buildMockMapa(fromISO = '2025-11-01', days = 14) {
  const startDate = new Date(fromISO);
  const daysArray = [];
  
  // Generar array de días
  for (let i = 0; i < days; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    
    const prevDate = i > 0 ? new Date(startDate) : null;
    if (prevDate) prevDate.setDate(startDate.getDate() + i - 1);
    
    const monthBreak = prevDate && current.getMonth() !== prevDate.getMonth();
    
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const dayName = dayNames[current.getDay()];
    const dayNumber = current.getDate();
    
    daysArray.push({
      date: current.toISOString().split('T')[0],
      labelShort: `${dayName} ${dayNumber}`,
      monthBreak
    });
  }
  
  // Calcular índice del día focal (hoy si está en rango, sino el primero)
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = daysArray.findIndex(d => d.date === today);
  const focalDayIndex = todayIndex >= 0 ? todayIndex : 0;
  
  // Generar KPIs por día (mock)
  const generateKPIs = (totalRooms) => {
    return daysArray.map((_, idx) => {
      // Simulamos disponibilidad variable
      const disponibles = Math.max(0, totalRooms - Math.floor(Math.random() * (totalRooms + 1)));
      const adr = 150 + Math.random() * 350; // ADR entre 150 y 500
      return {
        disponibles,
        adr: parseFloat(adr.toFixed(2))
      };
    });
  };
  
  // Grupos mock
  const grupos = [
    {
      tipoId: 1,
      tipoNombre: 'Suite',
      totalActivas: 3,
      kpiPorDia: generateKPIs(3),
      habitaciones: [
        {
          id: 101,
          numero: '#101',
          cerrada: false,
          barras: [
            {
              kind: 'reserva',
              estadoReserva: 'Confirmada',
              desde: daysArray[2]?.date,
              hasta: daysArray[5]?.date,
              label: 'J. Smith',
              huespedNombre: 'John Smith',
              montoPendiente: 0
            }
          ]
        },
        {
          id: 102,
          numero: '#102',
          cerrada: false,
          barras: [
            {
              kind: 'reserva',
              estadoReserva: 'EnCurso',
              desde: daysArray[1]?.date,
              hasta: daysArray[4]?.date,
              label: 'M. García',
              huespedNombre: 'María García',
              montoPendiente: 450.00
            },
            {
              kind: 'bloqueo',
              desde: daysArray[8]?.date,
              hasta: daysArray[10]?.date,
              label: 'Mantenimiento'
            }
          ]
        },
        {
          id: 103,
          numero: '#103',
          cerrada: true,
          barras: [
            {
              kind: 'bloqueo',
              desde: daysArray[0]?.date,
              hasta: daysArray[days - 1]?.date,
              label: 'Fuera de servicio'
            }
          ]
        }
      ]
    },
    {
      tipoId: 2,
      tipoNombre: 'Deluxe',
      totalActivas: 4,
      kpiPorDia: generateKPIs(4),
      habitaciones: [
        {
          id: 201,
          numero: '#201',
          cerrada: false,
          barras: [
            {
              kind: 'reserva',
              estadoReserva: 'Confirmada',
              desde: daysArray[3]?.date,
              hasta: daysArray[7]?.date,
              label: 'A. López',
              huespedNombre: 'Ana López',
              montoPendiente: 0
            }
          ]
        },
        {
          id: 202,
          numero: '#202',
          cerrada: false,
          barras: [
            {
              kind: 'reserva',
              estadoReserva: 'EnCurso',
              desde: daysArray[0]?.date,
              hasta: daysArray[3]?.date,
              label: 'P. Rodríguez',
              huespedNombre: 'Pedro Rodríguez',
              montoPendiente: 280.50
            }
          ]
        },
        {
          id: 203,
          numero: '#203',
          cerrada: false,
          barras: []
        },
        {
          id: 204,
          numero: '#204',
          cerrada: false,
          barras: [
            {
              kind: 'reserva',
              estadoReserva: 'Confirmada',
              desde: daysArray[6]?.date,
              hasta: daysArray[9]?.date,
              label: 'L. Martínez',
              huespedNombre: 'Laura Martínez',
              montoPendiente: 0
            }
          ]
        }
      ]
    },
    {
      tipoId: 3,
      tipoNombre: 'Estándar',
      totalActivas: 5,
      kpiPorDia: generateKPIs(5),
      habitaciones: [
        {
          id: 301,
          numero: '#301',
          cerrada: false,
          barras: [
            {
              kind: 'reserva',
              estadoReserva: 'Confirmada',
              desde: daysArray[1]?.date,
              hasta: daysArray[4]?.date,
              label: 'C. Fernández',
              huespedNombre: 'Carlos Fernández',
              montoPendiente: 0
            }
          ]
        },
        {
          id: 302,
          numero: '#302',
          cerrada: false,
          barras: []
        },
        {
          id: 303,
          numero: '#303',
          cerrada: false,
          barras: [
            {
              kind: 'reserva',
              estadoReserva: 'EnCurso',
              desde: daysArray[5]?.date,
              hasta: daysArray[8]?.date,
              label: 'S. González',
              huespedNombre: 'Sofía González',
              montoPendiente: 120.00
            }
          ]
        },
        {
          id: 304,
          numero: '#304',
          cerrada: false,
          barras: []
        },
        {
          id: 305,
          numero: '#305',
          cerrada: false,
          barras: [
            {
              kind: 'bloqueo',
              desde: daysArray[10]?.date,
              hasta: daysArray[12]?.date,
              label: 'Reparación'
            }
          ]
        }
      ]
    }
  ];
  
  return {
    days: daysArray,
    grupos,
    focalDayIndex
  };
}
