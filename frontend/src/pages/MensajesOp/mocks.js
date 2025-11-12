/**
 * Datos mock para la página de administración de mensajes
 * Separados del componente para facilitar testing y futura integración con API
 */

export const mockMensajes = [
  {
    id: 1,
    asunto: "Consulta sobre disponibilidad Suite Premium",
    remitente: "Carlos Rodríguez",
    email: "carlos.rodriguez@email.com",
    canal: "Web",
    prioridad: "Alta",
    fecha: "2025-11-03T14:30:00",
    estado: "Pendiente",
    contenido: "Buenos días, quisiera consultar sobre la disponibilidad de la Suite Premium para el fin de semana del 15 al 17 de noviembre. Somos dos adultos y necesitamos confirmar cuanto antes. ¿Incluye desayuno? Gracias."
  },
  {
    id: 2,
    asunto: "Modificación de reserva #456",
    remitente: "María González",
    email: "maria.gonzalez@email.com",
    canal: "Email",
    prioridad: "Media",
    fecha: "2025-11-03T10:15:00",
    estado: "Respondido",
    contenido: "Hola, necesito modificar mi reserva #456 para agregar una noche más. La reserva actual es del 20 al 22 de noviembre, quisiera extender hasta el 23. ¿Es posible? ¿Cuál sería el costo adicional?",
    respuesta: "Hola María, claro que podemos extender tu reserva. El costo adicional sería de $85.000. Te enviamos el link de pago por separado. Saludos."
  },
  {
    id: 3,
    asunto: "Problema con el pago",
    remitente: "Juan Pérez",
    email: "juan.perez@email.com",
    canal: "WhatsApp",
    prioridad: "Alta",
    fecha: "2025-11-03T09:45:00",
    estado: "Pendiente",
    contenido: "Hola, estoy intentando pagar mi reserva pero la página me da error. Ya intenté con dos tarjetas diferentes. El número de reserva es #789. Por favor ayuda urgente."
  },
  {
    id: 4,
    asunto: "Consulta sobre servicios adicionales",
    remitente: "Ana Martínez",
    email: "ana.martinez@email.com",
    canal: "Web",
    prioridad: "Baja",
    fecha: "2025-11-02T18:20:00",
    estado: "Respondido",
    contenido: "Buenas tardes, quisiera saber si ofrecen servicio de transporte desde el aeropuerto. Llego el 25 de noviembre a las 20:00 hs. Tengo reserva confirmada.",
    respuesta: "Hola Ana, sí ofrecemos servicio de transfer. El costo es de $15.000. Por favor confirmanos con 24hs de anticipación. Gracias."
  },
  {
    id: 5,
    asunto: "Solicitud de factura",
    remitente: "Roberto Silva",
    email: "roberto.silva@empresa.com",
    canal: "Email",
    prioridad: "Media",
    fecha: "2025-11-02T16:00:00",
    estado: "Pendiente",
    contenido: "Estimados, necesito la factura de mi estadía del 28 al 30 de octubre. Reserva #234. Los datos fiscales son: CUIT 30-12345678-9, Empresa SA, dirección calle falsa 123. Gracias."
  },
  {
    id: 6,
    asunto: "Felicitaciones por el servicio",
    remitente: "Laura Fernández",
    email: "laura.fernandez@email.com",
    canal: "Web",
    prioridad: "Baja",
    fecha: "2025-11-02T12:30:00",
    estado: "Respondido",
    contenido: "Quería agradecerles por la excelente atención durante nuestra estadía. El personal fue muy amable y las instalaciones impecables. Definitivamente volveremos!",
    respuesta: "¡Muchas gracias Laura! Nos alegra muchísimo saber que disfrutaron su estadía. Los esperamos pronto. Saludos cordiales."
  },
  {
    id: 7,
    asunto: "Cancelación de reserva",
    remitente: "Diego López",
    email: "diego.lopez@email.com",
    canal: "WhatsApp",
    prioridad: "Alta",
    fecha: "2025-11-02T08:15:00",
    estado: "Respondido",
    contenido: "Buenos días, lamentablemente tengo que cancelar mi reserva #567 por un imprevisto laboral. La reserva es para el 10 de noviembre. ¿Hay algún cargo por cancelación?",
    respuesta: "Hola Diego, entendemos. Como la cancelación es con más de 48hs de anticipación, no hay cargo. Te reembolsaremos el 100%. Procesaremos en 5 días hábiles."
  },
  {
    id: 8,
    asunto: "Consulta sobre política de mascotas",
    remitente: "Sofía González",
    email: "sofia.gonzalez@email.com",
    canal: "Web",
    prioridad: "Media",
    fecha: "2025-11-01T20:45:00",
    estado: "Pendiente",
    contenido: "Hola, quisiera saber si permiten mascotas. Tengo un perro pequeño (5kg) muy tranquilo. Estaría viajando del 12 al 14 de noviembre. ¿Hay algún cargo adicional?"
  },
  {
    id: 9,
    asunto: "Reserva para grupo de 8 personas",
    remitente: "Miguel Sánchez",
    email: "miguel.sanchez@email.com",
    canal: "Email",
    prioridad: "Alta",
    fecha: "2025-11-01T15:30:00",
    estado: "Pendiente",
    contenido: "Buenos días, necesito reservar para un grupo de 8 personas (6 adultos, 2 niños) del 18 al 20 de noviembre. ¿Tienen disponibilidad? ¿Hacen descuento por grupo? Somos una familia."
  },
  {
    id: 10,
    asunto: "Información sobre check-in anticipado",
    remitente: "Patricia Ruiz",
    email: "patricia.ruiz@email.com",
    canal: "Web",
    prioridad: "Baja",
    fecha: "2025-11-01T11:00:00",
    estado: "Respondido",
    contenido: "Hola, mi vuelo llega a las 10:00 am. ¿Es posible hacer check-in anticipado? Tengo reserva para el 8 de noviembre. Número de reserva #890.",
    respuesta: "Hola Patricia, sí podemos gestionar early check-in sujeto a disponibilidad. Te sugerimos llamarnos ese día a las 9am para confirmar. Sin cargo adicional si hay habitaciones listas."
  }
];

/**
 * Calcula totales y estadísticas de mensajes
 * @param {Array} mensajes - Array de mensajes
 * @returns {Object} Estadísticas calculadas
 */
export const calcularEstadisticas = (mensajes) => {
  const total = mensajes.length;
  const pendientes = mensajes.filter((m) => m.estado === "Pendiente").length;
  const respondidos = mensajes.filter((m) => m.estado === "Respondido").length;
  
  // Mensajes de las últimas 24 horas
  const ahora = new Date();
  const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
  const ultimas24h = mensajes.filter((m) => new Date(m.fecha) >= hace24h).length;
  
  // Estadísticas por canal
  const porCanal = {
    Web: mensajes.filter((m) => m.canal === "Web").length,
    Email: mensajes.filter((m) => m.canal === "Email").length,
    WhatsApp: mensajes.filter((m) => m.canal === "WhatsApp").length
  };
  
  // Estadísticas por prioridad
  const porPrioridad = {
    Alta: mensajes.filter((m) => m.prioridad === "Alta").length,
    Media: mensajes.filter((m) => m.prioridad === "Media").length,
    Baja: mensajes.filter((m) => m.prioridad === "Baja").length
  };
  
  return {
    total,
    pendientes,
    respondidos,
    ultimas24h,
    porCanal,
    porPrioridad
  };
};

/**
 * Filtra mensajes según criterios
 * @param {Array} mensajes - Array de mensajes
 * @param {Object} filtros - Objeto con criterios de filtrado
 * @returns {Array} Mensajes filtrados
 */
export const filtrarMensajes = (mensajes, filtros) => {
  return mensajes.filter((mensaje) => {
    // Filtro por texto (busca en asunto, remitente y email)
    if (filtros.texto) {
      const textoLower = filtros.texto.toLowerCase();
      const coincide = 
        mensaje.asunto.toLowerCase().includes(textoLower) ||
        mensaje.remitente.toLowerCase().includes(textoLower) ||
        mensaje.email.toLowerCase().includes(textoLower) ||
        mensaje.contenido.toLowerCase().includes(textoLower);
      if (!coincide) return false;
    }
    
    // Filtro por estado
    if (filtros.estado && filtros.estado !== "Todos") {
      if (mensaje.estado !== filtros.estado) return false;
    }
    
    // Filtro por canal
    if (filtros.canal && filtros.canal !== "Todos") {
      if (mensaje.canal !== filtros.canal) return false;
    }
    
    // Filtro por prioridad
    if (filtros.prioridad && filtros.prioridad !== "Todos") {
      if (mensaje.prioridad !== filtros.prioridad) return false;
    }
    
    // Filtro por rango de fechas
    if (filtros.fechaDesde) {
      const fechaMensaje = new Date(mensaje.fecha);
      const fechaDesde = new Date(filtros.fechaDesde);
      if (fechaMensaje < fechaDesde) return false;
    }
    
    if (filtros.fechaHasta) {
      const fechaMensaje = new Date(mensaje.fecha);
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      if (fechaMensaje > fechaHasta) return false;
    }
    
    return true;
  });
};
