import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaEye, FaBed, FaDollarSign, FaUsers } from 'react-icons/fa';
import FiltroTiposHabitacion from '../../components/TiposHabitacion/FiltroTiposHabitacion/FiltroTiposHabitacion.jsx';
import DetalleTipoHabitacion from '../../components/TiposHabitacion/DetalleTipoHabitacion/DetalleTipoHabitacion.jsx';
import styles from './TiposHabitacionPage.module.css';

// TODO: reemplazar mocks por datos de API
const tiposHabitacionMock = [
  {
    id: 1,
    nombre: "Estándar Doble",
    descripcion: "Habitación cómoda y acogedora diseñada para dos personas. Cuenta con todas las comodidades necesarias para una estadía placentera, incluyendo baño privado, escritorio y zona de estar.",
    tarifaBase: 45000,
    capacidadMaxima: 2,
    cantidadHabitaciones: 5,
    categoria: "Estándar",
    ocupacion: "2 adultos",
    descripcionCamas: "1 cama matrimonial o 2 camas individuales",
    superficie: 25,
    vista: "Vista a la ciudad",
    politicas: "Check-in: 15:00 hs | Check-out: 11:00 hs | Cancelación gratuita hasta 24 hs antes",
    amenidades: [
      { nombre: "Wi-Fi", icono: "📶" },
      { nombre: "TV Cable", icono: "📺" },
      { nombre: "Aire acondicionado", icono: "❄️" },
      { nombre: "Minibar", icono: "🍷" },
      { nombre: "Caja fuerte", icono: "🔒" },
      { nombre: "Secador de pelo", icono: "💨" }
    ],
    habitacionesVinculadas: [
      { numero: "201", piso: 2, estado: "Disponible" },
      { numero: "202", piso: 2, estado: "Ocupada" },
      { numero: "301", piso: 3, estado: "Disponible" },
      { numero: "302", piso: 3, estado: "Limpieza" },
      { numero: "401", piso: 4, estado: "Disponible" }
    ],
    imagenes: [
      { url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400", descripcion: "Vista general" },
      { url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400", descripcion: "Baño" },
      { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400", descripcion: "Zona de estar" },
      { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400", descripcion: "Vista nocturna" }
    ]
  },
  {
    id: 2,
    nombre: "Suite Familiar",
    descripcion: "Espaciosa suite ideal para familias, con living independiente y dos dormitorios separados. Perfecta para grupos que buscan comodidad y privacidad. Incluye cocina equipada y amplio balcón.",
    tarifaBase: 90000,
    capacidadMaxima: 4,
    cantidadHabitaciones: 3,
    categoria: "Premium",
    ocupacion: "4 adultos o 2 adultos + 2 niños",
    descripcionCamas: "1 cama king + 2 camas individuales",
    superficie: 55,
    vista: "Vista al jardín",
    politicas: "Check-in: 14:00 hs | Check-out: 12:00 hs | Cancelación gratuita hasta 48 hs antes",
    amenidades: [
      { nombre: "Wi-Fi", icono: "📶" },
      { nombre: "Smart TV", icono: "📺" },
      { nombre: "Aire acondicionado", icono: "❄️" },
      { nombre: "Cocina equipada", icono: "🍳" },
      { nombre: "Balcón privado", icono: "🏞️" },
      { nombre: "Caja fuerte", icono: "🔒" },
      { nombre: "Cafetera", icono: "☕" },
      { nombre: "Plancha", icono: "👔" }
    ],
    habitacionesVinculadas: [
      { numero: "501", piso: 5, estado: "Disponible" },
      { numero: "502", piso: 5, estado: "Ocupada" },
      { numero: "601", piso: 6, estado: "Disponible" }
    ],
    imagenes: [
      { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", descripcion: "Living" },
      { url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400", descripcion: "Dormitorio principal" },
      { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400", descripcion: "Cocina" },
      { url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400", descripcion: "Balcón" }
    ]
  },
  {
    id: 3,
    nombre: "Habitación Simple",
    descripcion: "Perfecta para viajeros solitarios.",
    tarifaBase: 35000,
    capacidadMaxima: 1,
    cantidadHabitaciones: 8,
  },
  {
    id: 4,
    nombre: "Suite Ejecutiva",
    descripcion: "Espacio de trabajo y descanso premium.",
    tarifaBase: 75000,
    capacidadMaxima: 2,
    cantidadHabitaciones: 4,
  },
  {
    id: 5,
    nombre: "Habitación Triple",
    descripcion: "Amplia habitación para tres personas.",
    tarifaBase: 60000,
    capacidadMaxima: 3,
    cantidadHabitaciones: 6,
  },
  {
    id: 6,
    nombre: "Suite Presidencial",
    descripcion: "Lujo y confort en su máxima expresión.",
    tarifaBase: 150000,
    capacidadMaxima: 4,
    cantidadHabitaciones: 1,
  },
  {
    id: 7,
    nombre: "Habitación Doble Superior",
    descripcion: "Habitación doble con vista panorámica.",
    tarifaBase: 55000,
    capacidadMaxima: 2,
    cantidadHabitaciones: 7,
  },
  {
    id: 8,
    nombre: "Suite Junior",
    descripcion: "Suite compacta con todas las comodidades.",
    tarifaBase: 65000,
    capacidadMaxima: 2,
    cantidadHabitaciones: 5,
  },
  {
    id: 9,
    nombre: "Habitación Cuádruple",
    descripcion: "Ideal para grupos pequeños o familias grandes.",
    tarifaBase: 80000,
    capacidadMaxima: 4,
    cantidadHabitaciones: 3,
  },
  {
    id: 10,
    nombre: "Suite Nupcial",
    descripcion: "Romántica suite para luna de miel.",
    tarifaBase: 120000,
    capacidadMaxima: 2,
    cantidadHabitaciones: 2,
  },
  {
    id: 11,
    nombre: "Habitación Económica",
    descripcion: "Opción accesible sin sacrificar comodidad.",
    tarifaBase: 30000,
    capacidadMaxima: 1,
    cantidadHabitaciones: 10,
  },
  {
    id: 12,
    nombre: "Suite con Jacuzzi",
    descripcion: "Relájate en tu propia suite con jacuzzi privado.",
    tarifaBase: 110000,
    capacidadMaxima: 2,
    cantidadHabitaciones: 2,
  },
  {
    id: 13,
    nombre: "Habitación Familiar Deluxe",
    descripcion: "Espaciosa habitación con dos camas queen.",
    tarifaBase: 95000,
    capacidadMaxima: 5,
    cantidadHabitaciones: 4,
  },
  {
    id: 14,
    nombre: "Estudio",
    descripcion: "Ambiente integrado con kitchenette.",
    tarifaBase: 50000,
    capacidadMaxima: 2,
    cantidadHabitaciones: 6,
  },
  {
    id: 15,
    nombre: "Penthouse",
    descripcion: "Último piso con terraza privada y vista 360°.",
    tarifaBase: 200000,
    capacidadMaxima: 6,
    cantidadHabitaciones: 1,
  },
];

export default function TiposHabitacionPage() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Estado para tipos de habitación (ahora desde API)
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Estados para ordenamiento
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    q: '',
    capacidad: 'Todas',
    precioDesde: '',
    precioHasta: ''
  });
  
  // Estado para modal de detalle
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  
  // Cargar tipos de habitación desde el backend
  useEffect(() => {
    const cargarTiposHabitacion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/tipos-habitacion`);
        console.log('✅ Tipos de habitación cargados:', response.data);
        
        // Transformar datos del backend al formato esperado por el frontend
        const tiposTransformados = response.data.map(tipo => ({
          id: tipo.id,
          nombre: tipo.nombre,
          descripcion: tipo.descripcion || '',
          tarifaBase: Number(tipo.tarifaBase) || 0, // ✅ Asegurar que sea número
          capacidadMaxima: tipo.ocupacion?.capacidad || 0,
          cantidadHabitaciones: tipo.cantidadHabitaciones || 0,
          categoria: tipo.categoria?.nombre || '',
          ocupacion: tipo.ocupacion?.nombre || '',
          // Campos adicionales para el modal de detalle
          superficie: tipo.superficie,
          vista: tipo.vista,
          politicas: tipo.politicas,
          amenidades: tipo.amenidades?.map(a => a.amenidad || a) || [],
          imagenes: tipo.imagenes || [],
        }));
        
        setTiposHabitacion(tiposTransformados);
        console.log(`✅ ${tiposTransformados.length} tipos de habitación cargados`);
      } catch (err) {
        console.error('❌ Error al cargar tipos de habitación:', err);
        setError('Error al cargar los tipos de habitación');
        toast.error('Error al cargar los datos');
        // Fallback a mocks en caso de error
        setTiposHabitacion(tiposHabitacionMock);
      } finally {
        setLoading(false);
      }
    };
    
    cargarTiposHabitacion();
  }, []);
  
  // Función para manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  // Handlers de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setCurrentPage(1);
  };

  const handleClearFiltros = () => {
    setFiltros({
      q: '',
      capacidad: 'Todas',
      precioDesde: '',
      precioHasta: ''
    });
    setCurrentPage(1);
  };

  const handleApplyFiltros = () => {
    setCurrentPage(1);
  };
  
  // Aplicar filtros primero
  const tiposFiltrados = useMemo(() => {
    console.log('🔍 Aplicando filtros:', filtros);
    
    const resultados = tiposHabitacion.filter(tipo => {
      // Filtro por búsqueda general (nombre o categoría)
      if (filtros.q) {
        const textoLower = filtros.q.toLowerCase();
        const coincide = 
          tipo.nombre.toLowerCase().includes(textoLower) ||
          (tipo.categoria && tipo.categoria.toLowerCase().includes(textoLower));
        if (!coincide) return false;
      }
      
      // Filtro por capacidad
      if (filtros.capacidad && filtros.capacidad !== 'Todas') {
        const capacidadNum = parseInt(filtros.capacidad);
        if (filtros.capacidad === '5+') {
          if (tipo.capacidadMaxima < 5) return false;
        } else {
          if (tipo.capacidadMaxima !== capacidadNum) return false;
        }
      }
      
      // Filtro por precio desde
      if (filtros.precioDesde) {
        const precioDesde = parseFloat(filtros.precioDesde);
        if (!isNaN(precioDesde) && tipo.tarifaBase < precioDesde) return false;
      }
      
      // Filtro por precio hasta
      if (filtros.precioHasta) {
        const precioHasta = parseFloat(filtros.precioHasta);
        if (!isNaN(precioHasta) && tipo.tarifaBase > precioHasta) return false;
      }
      
      return true;
    });
    
    console.log(`✅ Filtrados: ${resultados.length} de ${tiposHabitacion.length} tipos`);
    return resultados;
  }, [tiposHabitacion, filtros]);
  
  // Calcular estadísticas basadas en tipos filtrados
  const estadisticas = useMemo(() => {
    const total = tiposFiltrados.length;
    
    // Calcular precio promedio: sumar todos los precios y dividir por la cantidad
    let precioPromedio = 0;
    if (tiposFiltrados.length > 0) {
      const sumaPrecios = tiposFiltrados.reduce((sum, t) => {
        const precio = Number(t.tarifaBase) || 0;
        return sum + precio;
      }, 0);
      precioPromedio = Math.round(sumaPrecios / tiposFiltrados.length);
      
      // 🔍 DEBUG
      console.log('📊 Cálculo de precio promedio:', {
        cantidadTipos: tiposFiltrados.length,
        sumaPrecios,
        precioPromedio,
        precios: tiposFiltrados.map(t => ({ nombre: t.nombre, precio: t.tarifaBase }))
      });
    }
    
    const capacidadMaxima = tiposFiltrados.length > 0
      ? Math.max(...tiposFiltrados.map(t => t.capacidadMaxima))
      : 0;
    
    return { total, precioPromedio, capacidadMaxima };
  }, [tiposFiltrados]);
  
  // Ordenar tipos filtrados
  const tiposOrdenados = useMemo(() => {
    const sorted = [...tiposFiltrados].sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === 'nombre') {
        aVal = a.nombre.toLowerCase();
        bVal = b.nombre.toLowerCase();
      } else if (sortField === 'tarifaBase') {
        aVal = a.tarifaBase;
        bVal = b.tarifaBase;
      } else if (sortField === 'capacidadMaxima') {
        aVal = a.capacidadMaxima;
        bVal = b.capacidadMaxima;
      } else if (sortField === 'cantidadHabitaciones') {
        aVal = a.cantidadHabitaciones;
        bVal = b.cantidadHabitaciones;
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return sorted;
  }, [tiposFiltrados, sortField, sortDirection]);
  
  // Calcular paginación
  const totalPages = Math.ceil(tiposOrdenados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tiposPaginados = tiposOrdenados.slice(startIndex, endIndex);
  
  // Handlers de paginación
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  // Formatear precio en formato argentino (puntos para miles, sin decimales)
  const formatearPrecio = (precio) => {
    if (!precio || isNaN(precio)) return '$ 0';
    
    // Convertir a número y formatear con puntos como separadores de miles
    const numero = Number(precio);
    const formateado = new Intl.NumberFormat('es-AR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numero);
    
    return `$ ${formateado}`;
  };
  
  // Truncar descripción
  const truncarTexto = (texto, maxLength = 60) => {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  };
  
  // Handlers de acciones
  const handleEditar = (tipo) => {
    navigate(`/crud-habitaciones/editar/${tipo.id}`);
  };
  
  const handleVer = async (tipo) => {
    try {
      // Cargar el detalle completo desde el backend
      const response = await axios.get(`${API_BASE_URL}/tipos-habitacion/${tipo.id}`);
      console.log('✅ Detalle completo cargado:', response.data);
      
      // Transformar para el modal
      const tipoCompleto = {
        ...response.data,
        capacidadMaxima: response.data.ocupacion?.capacidad || 0,
        categoria: response.data.categoria?.nombre || '',
        ocupacion: response.data.ocupacion?.nombre || '',
        descripcionCamas: response.data.ocupacion?.descripcionCamas || '',
        amenidades: response.data.amenidades || [],
      };
      
      setTipoSeleccionado(tipoCompleto);
    } catch (error) {
      console.error('❌ Error al cargar detalle:', error);
      toast.error('Error al cargar el detalle del tipo de habitación');
    }
  };
  
  const handleEliminar = async (tipo) => {
    // Mostrar toast de confirmación personalizado
    toast((t) => (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        padding: '8px'
      }}>
        <div>
          <p style={{ 
            margin: 0, 
            fontWeight: 600, 
            fontSize: '15px',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            ¿Estás seguro de eliminar el tipo "{tipo.nombre}"?
          </p>
          <p style={{ 
            margin: 0, 
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Esta acción no se puede deshacer.
          </p>
          <p style={{ 
            margin: 0, 
            fontSize: '12px',
            color: '#dc2626',
            fontWeight: 500
          }}>
            Nota: No se puede eliminar si tiene habitaciones vinculadas.
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end',
          marginTop: '4px'
        }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              background: 'white',
              color: '#374151',
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              
              try {
                console.log('🗑️ Eliminando tipo:', tipo.nombre);
                
                await axios.delete(`${API_BASE_URL}/tipos-habitacion/${tipo.id}`);
                
                toast.success(`Tipo "${tipo.nombre}" eliminado exitosamente`);
                
                // Recargar la lista
                const response = await axios.get(`${API_BASE_URL}/tipos-habitacion`);
                const tiposTransformados = response.data.map(t => ({
                  id: t.id,
                  nombre: t.nombre,
                  descripcion: t.descripcion || '',
                  tarifaBase: Number(t.tarifaBase) || 0,
                  capacidadMaxima: t.ocupacion?.capacidad || 0,
                  cantidadHabitaciones: t.cantidadHabitaciones || 0,
                  categoria: t.categoria?.nombre || '',
                  ocupacion: t.ocupacion?.nombre || '',
                  superficie: t.superficie,
                  vista: t.vista,
                  politicas: t.politicas,
                  amenidades: t.amenidades?.map(a => a.amenidad || a) || [],
                  imagenes: t.imagenes || [],
                }));
                
                setTiposHabitacion(tiposTransformados);
              } catch (error) {
                console.error('❌ Error al eliminar:', error);
                const mensaje = error.response?.data?.error || 'Error al eliminar el tipo de habitación';
                toast.error(mensaje);
                
                // Si el error es por habitaciones vinculadas, mostrar info adicional
                if (error.response?.data?.habitacionesVinculadas) {
                  toast.error(
                    `Tiene ${error.response.data.habitacionesVinculadas} habitaciones vinculadas`,
                    { duration: 5000 }
                  );
                }
              }
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: '#dc2626',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#b91c1c'}
            onMouseOut={(e) => e.target.style.background = '#dc2626'}
          >
            Eliminar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        maxWidth: '500px',
        padding: '16px',
      }
    });
  };
  
  const handleNuevoTipo = () => {
    navigate('/crud-habitaciones/nuevo');
  };
  
  // Componente para header ordenable
  const SortableHeader = ({ field, children }) => {
    const isActive = sortField === field;
    
    return (
      <th 
        onClick={() => handleSort(field)}
        className={styles.sortableHeader}
        title={`Ordenar por ${children}`}
      >
        <div className={styles.headerContent}>
          {children}
          <span className={styles.sortIcon}>
            {!isActive && <FaSort />}
            {isActive && sortDirection === 'asc' && <FaSortUp />}
            {isActive && sortDirection === 'desc' && <FaSortDown />}
          </span>
        </div>
      </th>
    );
  };
  
  return (
    <div className={styles.page}>
      <main className={styles.containerMain}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Panel de Administrador</span>
          <span className={styles.sep}>›</span>
          <span className={styles.pink}>Tipos de Habitación</span>
        </div>
        
        {/* Indicador de carga */}
        {loading && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '400px',
            fontSize: '18px',
            color: '#6b7280'
          }}>
            Cargando tipos de habitación...
          </div>
        )}
        
        {/* Mensaje de error */}
        {error && !loading && (
          <div style={{
            padding: '20px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        {/* Contenido principal - solo mostrar si no está cargando */}
        {!loading && (
          <>
        
        {/* Cabecera */}
        <div className={styles.headTop}>
          <div>
            <h2 className={styles.title}>Tipos de habitación</h2>
            <p className={styles.muted}>
              Administrá los tipos de habitación del hotel
            </p>
          </div>
          
          {/* Botón Nuevo Tipo */}
          <div>
            <button 
              className={styles.btnPrimary}
              onClick={handleNuevoTipo}
            >
              + Nuevo tipo de habitación
            </button>
          </div>
        </div>
        
        {/* Tarjetas de resumen */}
        <section className={styles.cards}>
          {/* Card Total */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#0c3f32',
              '--grad-end': '#1c6758'
            }}
          >
            <div className={styles.cardContent}>
              <p>Total de tipos</p>
              <h3 className={styles.value}>{estadisticas.total}</h3>
            </div>
            <div className={styles.cardIcon}><FaBed /></div>
          </div>
          
          {/* Card Precio Promedio */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#f59e0b',
              '--grad-end': '#d97706',
              animationDelay: '.05s'
            }}
          >
            <div className={styles.cardContent}>
              <p>Precio promedio</p>
              <h3 className={styles.value}>{formatearPrecio(estadisticas.precioPromedio)}</h3>
            </div>
            <div className={styles.cardIcon}><FaDollarSign /></div>
          </div>
          
          {/* Card Capacidad Máxima */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#3b82f6',
              '--grad-end': '#2563eb',
              animationDelay: '.1s'
            }}
          >
            <div className={styles.cardContent}>
              <p>Capacidad máxima</p>
              <h3 className={styles.value}>{estadisticas.capacidadMaxima} huéspedes</h3>
            </div>
            <div className={styles.cardIcon}><FaUsers /></div>
          </div>
        </section>
        
        {/* Filtros de búsqueda */}
        <FiltroTiposHabitacion
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onClear={handleClearFiltros}
          onApply={handleApplyFiltros}
        />
        
        {/* Tabla de tipos de habitación */}
        <section className={styles.tableWrap}>
          <div className={styles.tableHead}>
            <h3>🏨 Listado de Tipos de Habitación</h3>
            <span className={styles.tableInfo}>
              Mostrando {startIndex + 1} - {Math.min(endIndex, tiposOrdenados.length)} de {tiposOrdenados.length}
            </span>
          </div>
          
          <div className={styles.scrollX}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortableHeader field="nombre">Nombre</SortableHeader>
                  <SortableHeader field="tarifaBase">Precio base</SortableHeader>
                  <SortableHeader field="capacidadMaxima">Capacidad máx.</SortableHeader>
                  <SortableHeader field="cantidadHabitaciones">Habitaciones vinculadas</SortableHeader>
                  <th>Acciones</th>
                </tr>
              </thead>
              
              <tbody>
                {tiposPaginados.length > 0 ? (
                  tiposPaginados.map((tipo) => {
                    return (
                      <tr key={tipo.id}>
                        {/* Columna Nombre */}
                        <td>
                          <div className={styles.nombreCell}>
                            <div className={styles.nombrePrincipal}>
                              {tipo.nombre}
                            </div>
                            <div className={styles.nombreSecundario}>
                              <strong>{tipo.categoria}</strong> · {truncarTexto(tipo.descripcion, 50)}
                            </div>
                          </div>
                        </td>
                        
                        {/* Columna Precio base */}
                        <td>
                          <div className={styles.precioCell}>
                            {formatearPrecio(tipo.tarifaBase)}
                          </div>
                        </td>
                        
                        {/* Columna Capacidad máx. */}
                        <td>
                          <div className={styles.capacidadCell}>
                            {tipo.capacidadMaxima} huéspedes
                          </div>
                        </td>
                        
                        {/* Columna Habitaciones vinculadas */}
                        <td>
                          <div className={styles.habitacionesCell}>
                            {tipo.cantidadHabitaciones}
                          </div>
                        </td>
                        
                        {/* Columna Acciones */}
                        <td className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.btnEditar}`}
                            onClick={() => handleEditar(tipo)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.btnVer}`}
                            onClick={() => handleVer(tipo)}
                            title="Ver detalle"
                          >
                            <FaEye />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.btnEliminar}`}
                            onClick={() => handleEliminar(tipo)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      <div className={styles.emptyIcon}>🏨</div>
                      <p>No hay tipos de habitación para mostrar</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {tiposOrdenados.length > 0 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>
              <div className={styles.paginationControls}>
                <button
                  className={styles.btnPagination}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>
                <button
                  className={styles.btnPagination}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </section>
        
        {/* Modal de Detalle */}
        {tipoSeleccionado && (
          <DetalleTipoHabitacion
            tipo={tipoSeleccionado}
            onClose={() => setTipoSeleccionado(null)}
          />
        )}
        </>
        )}
      </main>
    </div>
  );
}
