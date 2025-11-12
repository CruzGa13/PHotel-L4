import { useState, useEffect, useRef } from 'react';
import { listHabitaciones, getCategorias, listBloqueos } from '../../services/habitaciones.api';
import { listReservas } from '../../services/reservas.api';
import toast from 'react-hot-toast';
import FiltroMapa from './FiltroMapa';
import './MapaTimeline.css';

export default function MapaTimeline() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diasVisibles] = useState(14); // Mostrar 14 días
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionesFiltradas, setHabitacionesFiltradas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const timelineRef = useRef(null);

  // Estado de filtros
  const [filtros, setFiltros] = useState({
    categoria: '',
    tipoHabitacion: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
    cargarCategorias();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar habitaciones (todas, ordenadas por número)
      const responseHabitaciones = await listHabitaciones({
        page: 1,
        pageSize: 100,
        orderBy: 'numero',
        dir: 'asc'
      });
      
      // Mapear habitaciones con la estructura necesaria
      const habitacionesMapeadas = (responseHabitaciones.items || []).map(h => ({
        id: h.id,
        numero: h.numero,
        tipo: h.tipoHabitacion?.ocupacion?.nombre || 'N/A',
        nombre: h.tipoHabitacion?.nombre || 'Sin nombre',
        categoria: h.tipoHabitacion?.categoria?.nombre || '',
        capacidad: h.tipoHabitacion?.ocupacion?.capacidad || 0
      }));
      
      setHabitaciones(habitacionesMapeadas);
      setHabitacionesFiltradas(habitacionesMapeadas); // Inicialmente mostrar todas
      
      // Cargar reservas activas (fecha actual +/- 30 días)
      const hoy = new Date();
      const hace30Dias = new Date(hoy);
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const en30Dias = new Date(hoy);
      en30Dias.setDate(en30Dias.getDate() + 30);
      
      const responseReservas = await listReservas({
        page: 1,
        pageSize: 200,
        fechaDesde: hace30Dias.toISOString().split('T')[0],
        fechaHasta: en30Dias.toISOString().split('T')[0]
      });
      
      // Mapear reservas con la estructura necesaria
      const reservasMapeadas = [];
      (responseReservas.rows || []).forEach(r => {
        // Una reserva puede tener múltiples habitaciones
        // En la respuesta de la API no tenemos acceso directo a las habitaciones individuales
        // pero podemos usar la información disponible
        
        // Parsear el checkIn y checkOut
        const inicio = new Date(r.checkIn);
        const fin = new Date(r.checkOut);
        
        // Mapear estado según el estado de la reserva
        let estadoMapeado = 'confirmada';
        if (r.estado === 'Pendiente') {
          estadoMapeado = 'pendiente';
        } else if (r.estado === 'Confirmada') {
          estadoMapeado = 'confirmada';
        } else if (r.estado === 'CheckIn') {
          estadoMapeado = 'ocupada';
        } else if (r.estado === 'CheckOut') {
          estadoMapeado = 'confirmada'; // Ya finalizada, mostramos como confirmada
        } else if (r.estado === 'Mantenimiento') {
          estadoMapeado = 'mantenimiento';
        }
        
        // Intentar extraer ID de habitación del numeroHabitacion
        // Si tiene formato "101 (+2)" solo tomar el primer número
        const numeroHab = r.numeroHabitacion?.split(' ')[0];
        const habitacionEncontrada = habitacionesMapeadas.find(h => h.numero === numeroHab);
        
        if (habitacionEncontrada) {
          reservasMapeadas.push({
            id: r.id,
            habitacionId: habitacionEncontrada.id,
            inicio,
            fin,
            estado: estadoMapeado,
            huesped: r.huesped || 'Sin nombre'
          });
        }
      });
      
      // Cargar bloqueos de habitaciones
      const responseBloqueos = await listBloqueos({
        fechaDesde: hace30Dias.toISOString().split('T')[0],
        fechaHasta: en30Dias.toISOString().split('T')[0]
      });
      
      // Mapear bloqueos como "reservas" con estado mantenimiento
      const bloqueosMapeados = (responseBloqueos || []).map(b => {
        const habitacionEncontrada = habitacionesMapeadas.find(h => h.numero === b.habitacion?.numero);
        
        if (!habitacionEncontrada) return null;
        
        return {
          id: `bloqueo-${b.id}`,
          habitacionId: habitacionEncontrada.id,
          inicio: new Date(b.desde),
          fin: new Date(b.hasta),
          estado: 'mantenimiento',
          huesped: b.motivo || b.tipo || 'En Mantenimiento'
        };
      }).filter(Boolean);
      
      // Combinar reservas y bloqueos
      const todosLosBloques = [...reservasMapeadas, ...bloqueosMapeados];
      setReservas(todosLosBloques);
      
      console.log('✅ Datos cargados:', {
        habitaciones: habitacionesMapeadas.length,
        reservas: reservasMapeadas.length,
        bloqueos: bloqueosMapeados.length,
        total: todosLosBloques.length
      });
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      toast.error('Error al cargar datos del mapa', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías desde la API
  const cargarCategorias = async () => {
    try {
      const cats = await getCategorias();
      setCategorias(cats || []);
      console.log('✅ Categorías cargadas:', cats.length);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
      toast.error('Error al cargar categorías', { position: 'top-center' });
    }
  };

  // Manejar cambio de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Aplicar filtros (botón Buscar)
  const aplicarFiltros = () => {
    let resultado = [...habitaciones];

    // Filtrar por categoría
    if (filtros.categoria && filtros.categoria.trim()) {
      resultado = resultado.filter(h => 
        h.categoria?.toLowerCase() === filtros.categoria.toLowerCase()
      );
    }

    // Filtrar por tipo de habitación (búsqueda parcial, insensible a mayúsculas)
    if (filtros.tipoHabitacion && filtros.tipoHabitacion.trim()) {
      const busqueda = filtros.tipoHabitacion.toLowerCase();
      resultado = resultado.filter(h => 
        h.nombre?.toLowerCase().includes(busqueda)
      );
    }

    setHabitacionesFiltradas(resultado);
    
    toast.success(`Se encontraron ${resultado.length} habitaciones`, { 
      position: 'top-center' 
    });
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      categoria: '',
      tipoHabitacion: ''
    });
    setHabitacionesFiltradas(habitaciones);
    toast.success('Filtros limpiados', { position: 'top-center' });
  };

  // Generar array de fechas a mostrar
  const generarFechas = () => {
    const fechas = [];
    const inicio = new Date(fechaActual);
    inicio.setDate(inicio.getDate() - 3); // Empezar 3 días antes de la fecha actual
    
    for (let i = 0; i < diasVisibles; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(fecha.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  };

  const fechas = generarFechas();

  // Funciones de navegación
  const irAHoy = () => {
    setFechaActual(new Date());
  };

  const avanzarDia = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    setFechaActual(nuevaFecha);
  };

  const retrocederDia = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    setFechaActual(nuevaFecha);
  };

  const avanzarMes = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    setFechaActual(nuevaFecha);
  };

  const retrocederMes = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    setFechaActual(nuevaFecha);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return {
      dia: dias[fecha.getDay()],
      numero: fecha.getDate(),
      mes: meses[fecha.getMonth()],
      completa: fecha.toDateString()
    };
  };

  // Verificar si una fecha es hoy
  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  };

  // Verificar si es fin de semana
  const esFinDeSemana = (fecha) => {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6;
  };

  // Obtener reservas de una habitación
  const obtenerReservasHabitacion = (habitacionId) => {
    return reservas.filter(r => r.habitacionId === habitacionId);
  };

  // Calcular posición y ancho de una reserva
  const calcularPosicionReserva = (reserva, fechas) => {
    const primeraFecha = fechas[0];
    const ultimaFecha = fechas[fechas.length - 1];
    
    // Si la reserva no está en el rango visible, no mostrarla
    if (reserva.fin < primeraFecha || reserva.inicio > ultimaFecha) {
      return null;
    }

    // Calcular inicio y fin visibles
    const inicioVisible = reserva.inicio < primeraFecha ? primeraFecha : reserva.inicio;
    const finVisible = reserva.fin > ultimaFecha ? ultimaFecha : reserva.fin;

    // Calcular posición y ancho
    const diasDesdeInicio = Math.floor((inicioVisible - primeraFecha) / (1000 * 60 * 60 * 24));
    const duracion = Math.floor((finVisible - inicioVisible) / (1000 * 60 * 60 * 24)) + 1;

    return {
      left: diasDesdeInicio,
      width: duracion,
      esParcial: reserva.inicio < primeraFecha || reserva.fin > ultimaFecha
    };
  };

  // Obtener clase CSS según estado de reserva
  const obtenerClaseEstado = (estado) => {
    const clases = {
      'confirmada': 'reserva-confirmada',
      'ocupada': 'reserva-ocupada',
      'pendiente': 'reserva-pendiente',
      'mantenimiento': 'reserva-mantenimiento'
    };
    return clases[estado] || 'reserva-confirmada';
  };

  // Scroll al día actual al montar el componente
  useEffect(() => {
    if (timelineRef.current) {
      const diaActualIndex = fechas.findIndex(f => esHoy(f));
      if (diaActualIndex !== -1) {
        const scrollPosition = diaActualIndex * 100; // 100px por columna
        timelineRef.current.scrollLeft = scrollPosition - 200; // Offset para centrarlo mejor
      }
    }
  }, [fechaActual]);

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="mapa-timeline-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando mapa de habitaciones...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay habitaciones
  if (habitaciones.length === 0) {
    return (
      <div className="mapa-timeline-container">
        <div className="empty-state">
          <div className="empty-icon">🏨</div>
          <p>No hay habitaciones registradas</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Componente de filtros */}
      <FiltroMapa
        filtros={filtros}
        opcionesCategorias={categorias}
        onFiltroChange={handleFiltroChange}
        onBuscar={aplicarFiltros}
        onLimpiar={limpiarFiltros}
      />

      <div className="mapa-timeline-container">
        {/* Panel de navegación superior */}
        <div className="panel-navegacion">
        <div className="fecha-actual-info">
          <span className="fecha-label">Fecha actual:</span>
          <span className="fecha-valor">
            {formatearFecha(fechaActual).dia}, {formatearFecha(fechaActual).numero} de {formatearFecha(fechaActual).mes}
          </span>
        </div>

        <div className="controles-navegacion">
          {/* Navegación por mes */}
          <button 
            className="btn-nav btn-mes" 
            onClick={retrocederMes}
            title="Mes anterior"
          >
            <span>«</span>
          </button>
          
          {/* Navegación por día */}
          <button 
            className="btn-nav btn-dia" 
            onClick={retrocederDia}
            title="Día anterior"
          >
            <span>‹</span>
          </button>

          {/* Botón Hoy */}
          <button 
            className="btn-hoy" 
            onClick={irAHoy}
          >
            Hoy
          </button>

          {/* Navegación por día */}
          <button 
            className="btn-nav btn-dia" 
            onClick={avanzarDia}
            title="Día siguiente"
          >
            <span>›</span>
          </button>

          {/* Navegación por mes */}
          <button 
            className="btn-nav btn-mes" 
            onClick={avanzarMes}
            title="Mes siguiente"
          >
            <span>»</span>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-wrapper" ref={timelineRef}>
        <div className="timeline-grid">
          {/* Columna de habitaciones (sticky) */}
          <div className="habitaciones-columna">
            <div className="header-habitacion sticky-header">
              <span>Habitación</span>
            </div>
            {habitacionesFiltradas.map(habitacion => (
              <div key={habitacion.id} className="habitacion-row-header">
                <div className="habitacion-numero">{habitacion.numero}</div>
                <div className="habitacion-categoria">{habitacion.categoria}</div>
                <div className="habitacion-tipo">{habitacion.nombre}</div>
              </div>
            ))}
          </div>

          {/* Columna de fechas y reservas */}
          <div className="fechas-container">
            {/* Cabecera de fechas (sticky) */}
            <div className="fechas-header sticky-header">
              {fechas.map((fecha, index) => {
                const fechaInfo = formatearFecha(fecha);
                const isHoy = esHoy(fecha);
                const isFinDeSemana = esFinDeSemana(fecha);
                
                return (
                  <div 
                    key={index} 
                    className={`fecha-cell ${isHoy ? 'fecha-hoy' : ''} ${isFinDeSemana ? 'fecha-weekend' : ''}`}
                  >
                    <div className="fecha-dia">{fechaInfo.dia}</div>
                    <div className="fecha-numero">{fechaInfo.numero}</div>
                    <div className="fecha-mes">{fechaInfo.mes}</div>
                  </div>
                );
              })}
            </div>

            {/* Filas de habitaciones con reservas */}
            <div className="habitaciones-rows">
              {habitacionesFiltradas.map(habitacion => {
                const reservas = obtenerReservasHabitacion(habitacion.id);
                
                return (
                  <div key={habitacion.id} className="habitacion-row">
                    {fechas.map((fecha, index) => {
                      const isHoy = esHoy(fecha);
                      const isFinDeSemana = esFinDeSemana(fecha);
                      
                      return (
                        <div 
                          key={index} 
                          className={`dia-cell ${isHoy ? 'dia-hoy' : ''} ${isFinDeSemana ? 'dia-weekend' : ''}`}
                        />
                      );
                    })}
                    
                    {/* Reservas superpuestas */}
                    {reservas.map(reserva => {
                      const posicion = calcularPosicionReserva(reserva, fechas);
                      if (!posicion) return null;
                      
                      return (
                        <div
                          key={reserva.id}
                          className={`reserva-block ${obtenerClaseEstado(reserva.estado)} ${posicion.esParcial ? 'reserva-parcial' : ''}`}
                          style={{
                            left: `${posicion.left * 100}px`,
                            width: `${posicion.width * 100}px`
                          }}
                          title={`${reserva.huesped} - ${reserva.estado}`}
                        >
                          <span className="reserva-texto">{reserva.huesped}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda de colores (fija en esquina inferior) */}
      <div className="leyenda-timeline">
        <div className="leyenda-item">
          <span className="leyenda-color reserva-confirmada"></span>
          <span className="leyenda-texto">Confirmada</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color reserva-ocupada"></span>
          <span className="leyenda-texto">Ocupada</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color reserva-pendiente"></span>
          <span className="leyenda-texto">Pendiente</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color reserva-mantenimiento"></span>
          <span className="leyenda-texto">En Mantenimiento</span>
        </div>
      </div>
    </div>
    </>
  );
}
