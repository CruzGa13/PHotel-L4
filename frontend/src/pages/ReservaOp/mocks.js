/**
 * Datos mock para la página de administración de reservas
 * Separados del componente para facilitar testing y futura integración con API
 */

export const mockReservas = [
  {
    id: 1,
    numeroHabitacion: "101",
    huesped: "Juan Pérez",
    nombreHabitacion: "Suite Premium",
    checkIn: "2025-10-25",
    checkOut: "2025-10-28",
    categoria: "Suite",
    tipoEspacio: "Doble",
    estado: "Confirmada",
    total: "$250.000",
    observacion: "Solicitó servicio de desayuno en habitación.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Administrador",
        fecha: "2025-10-15",
        hora: "10:34",
      },
      {
        accion: "Confirmación",
        usuario: "Recepción",
        fecha: "2025-10-16",
        hora: "11:10",
      },
    ],
  },
  {
    id: 2,
    numeroHabitacion: "202",
    huesped: "María Gómez",
    nombreHabitacion: "Habitación Deluxe",
    checkIn: "2025-10-26",
    checkOut: "2025-10-29",
    categoria: "Deluxe",
    tipoEspacio: "Triple",
    estado: "Cancelada",
    total: "$0",
    observacion: "Canceló por motivos personales.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Recepción",
        fecha: "2025-10-14",
        hora: "09:48",
      },
      {
        accion: "Cancelación",
        usuario: "María Gómez",
        fecha: "2025-10-20",
        hora: "16:25",
      },
    ],
  },
  {
    id: 3,
    numeroHabitacion: "303",
    huesped: "Carlos López",
    nombreHabitacion: "Habitación Estándar",
    checkIn: "2025-10-27",
    checkOut: "2025-10-30",
    categoria: "Estándar",
    tipoEspacio: "Individual",
    estado: "Confirmada",
    total: "$120.000",
    observacion: "Prefiere piso alto.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Recepción",
        fecha: "2025-10-18",
        hora: "13:12",
      },
    ],
  },
  {
    id: 4,
    numeroHabitacion: "205",
    huesped: "Ana Martínez",
    nombreHabitacion: "Suite Ejecutiva",
    checkIn: "2025-11-01",
    checkOut: "2025-11-05",
    categoria: "Suite",
    tipoEspacio: "Doble",
    estado: "Confirmada",
    total: "$420.000",
    observacion: "Cliente frecuente. Solicita cama king size.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Administrador",
        fecha: "2025-10-20",
        hora: "14:22",
      },
      {
        accion: "Confirmación",
        usuario: "Recepción",
        fecha: "2025-10-21",
        hora: "09:15",
      },
    ],
  },
  {
    id: 5,
    numeroHabitacion: "104",
    huesped: "Roberto Silva",
    nombreHabitacion: "Habitación Familiar",
    checkIn: "2025-11-10",
    checkOut: "2025-11-13",
    categoria: "Estándar",
    tipoEspacio: "Triple",
    estado: "Confirmada",
    total: "$180.000",
    observacion: "Viaja con dos niños pequeños.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Recepción",
        fecha: "2025-10-22",
        hora: "16:45",
      },
    ],
  },
];

/**
 * Totales calculados dinámicamente
 * @param {Array} reservas - Array de reservas
 * @returns {Object} Totales de reservas
 */
export const calcularTotales = (reservas) => {
  const total = reservas.length;
  const confirmadas = reservas.filter((r) => r.estado === "Confirmada").length;
  const canceladas = reservas.filter((r) => r.estado === "Cancelada").length;
  
  return { total, confirmadas, canceladas };
};
