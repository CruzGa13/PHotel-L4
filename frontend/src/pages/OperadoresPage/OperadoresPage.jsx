import { useState, useMemo, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaCheckCircle, FaTimesCircle, FaEye, FaTimes, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FiltroOperadores from '../../components/Operador/FiltroOperadores/FiltroOperadores.jsx';
import styles from './OperadoresPage.module.css';

// TODO: reemplazar mock por llamada real a la API
const operadoresMock = [
  {
    id: 'op-uuid-1a2b3c4d',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@hotel.com',
    telefono: '+54 9 387 555 0001',
    estado: true,
    fechaAlta: '2025-01-15T14:30:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1990-05-15T00:00:00Z',
    direccion: 'Av. San Martín 1234',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-2e3f4g5h',
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@hotel.com',
    telefono: '+54 9 387 555 0002',
    estado: true,
    fechaAlta: '2025-10-20T09:15:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1988-08-22T00:00:00Z',
    direccion: 'Calle Florida 567',
    provincia: 'Jujuy',
  },
  {
    id: 'op-uuid-3i4j5k6l',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@hotel.com',
    telefono: '+54 9 387 555 0003',
    estado: false,
    fechaAlta: '2025-09-15T11:45:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1985-12-10T00:00:00Z',
    direccion: 'Pasaje Los Álamos 89',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-4m5n6o7p',
    nombre: 'Ana',
    apellido: 'Martínez',
    email: 'ana.martinez@hotel.com',
    telefono: '+54 9 387 555 0004',
    estado: true,
    fechaAlta: '2025-10-18T16:20:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1992-03-30T00:00:00Z',
    direccion: 'Av. Belgrano 2345',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-5q6r7s8t',
    nombre: 'Luis',
    apellido: 'Fernández',
    email: 'luis.fernandez@hotel.com',
    telefono: '+54 9 387 555 0005',
    estado: true,
    fechaAlta: '2025-11-01T10:00:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1987-07-18T00:00:00Z',
    direccion: 'Urquiza 678',
    provincia: 'Tucumán',
  },
  {
    id: 'op-uuid-6u7v8w9x',
    nombre: 'Laura',
    apellido: 'López',
    email: 'laura.lopez@hotel.com',
    telefono: '+54 9 387 555 0006',
    estado: false,
    fechaAlta: '2025-08-22T13:30:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1995-11-05T00:00:00Z',
    direccion: 'Mitre 1122',
    provincia: 'Jujuy',
  },
  {
    id: 'op-uuid-7y8z9a0b',
    nombre: 'Pedro',
    apellido: 'Sánchez',
    email: 'pedro.sanchez@hotel.com',
    telefono: '+54 9 387 555 0007',
    estado: true,
    fechaAlta: '2025-10-30T08:45:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1991-04-20T00:00:00Z',
    direccion: 'Rivadavia 890',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-8c9d0e1f',
    nombre: 'Sofía',
    apellido: 'Ramírez',
    email: 'sofia.ramirez@hotel.com',
    telefono: '+54 9 387 555 0008',
    estado: true,
    fechaAlta: '2025-11-05T15:10:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1993-09-12T00:00:00Z',
    direccion: 'San Juan 445',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-9g0h1i2j',
    nombre: 'Miguel',
    apellido: 'Torres',
    email: 'miguel.torres@hotel.com',
    telefono: '+54 9 387 555 0009',
    estado: false,
    fechaAlta: '2025-07-10T12:00:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1986-01-25T00:00:00Z',
    direccion: 'Sarmiento 2233',
    provincia: 'Catamarca',
  },
  {
    id: 'op-uuid-0k1l2m3n',
    nombre: 'Lucía',
    apellido: 'Vargas',
    email: 'lucia.vargas@hotel.com',
    telefono: '+54 9 387 555 0010',
    estado: true,
    fechaAlta: '2025-10-28T14:25:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1994-06-08T00:00:00Z',
    direccion: 'Balcarce 334',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-1o2p3q4r',
    nombre: 'Javier',
    apellido: 'Romero',
    email: 'javier.romero@hotel.com',
    telefono: '+54 9 387 555 0011',
    estado: true,
    fechaAlta: '2025-11-08T09:30:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1989-10-14T00:00:00Z',
    direccion: 'Córdoba 1567',
    provincia: 'Tucumán',
  },
  {
    id: 'op-uuid-2s3t4u5v',
    nombre: 'Patricia',
    apellido: 'Morales',
    email: 'patricia.morales@hotel.com',
    telefono: '+54 9 387 555 0012',
    estado: false,
    fechaAlta: '2025-06-15T10:15:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1984-02-28T00:00:00Z',
    direccion: 'España 789',
    provincia: 'Jujuy',
  },
  {
    id: 'op-uuid-3w4x5y6z',
    nombre: 'Roberto',
    apellido: 'Jiménez',
    email: 'roberto.jimenez@hotel.com',
    telefono: '+54 9 387 555 0013',
    estado: true,
    fechaAlta: '2025-11-02T11:40:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1990-12-03T00:00:00Z',
    direccion: 'Alberdi 1890',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-4a5b6c7d',
    nombre: 'Gabriela',
    apellido: 'Ruiz',
    email: 'gabriela.ruiz@hotel.com',
    telefono: '+54 9 387 555 0014',
    estado: true,
    fechaAlta: '2025-10-15T13:55:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1996-05-17T00:00:00Z',
    direccion: 'Lavalle 556',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-5e6f7g8h',
    nombre: 'Diego',
    apellido: 'Méndez',
    email: 'diego.mendez@hotel.com',
    telefono: '+54 9 387 555 0015',
    estado: true,
    fechaAlta: '2025-11-10T16:05:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1988-08-09T00:00:00Z',
    direccion: 'Caseros 2112',
    provincia: 'Tucumán',
  },
  {
    id: 'op-uuid-6i7j8k9l',
    nombre: 'Valentina',
    apellido: 'Castro',
    email: 'valentina.castro@hotel.com',
    telefono: '+54 9 387 555 0016',
    estado: false,
    fechaAlta: '2025-05-20T14:20:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1997-03-21T00:00:00Z',
    direccion: 'Güemes 998',
    provincia: 'Salta',
  },
  {
    id: 'op-uuid-7m8n9o0p',
    nombre: 'Fernando',
    apellido: 'Ortiz',
    email: 'fernando.ortiz@hotel.com',
    telefono: '+54 9 387 555 0017',
    estado: true,
    fechaAlta: '2025-11-06T10:50:00Z',
    rol: 'Operador',
    genero: 'Masculino',
    fechaNacimiento: '1992-11-11T00:00:00Z',
    direccion: 'Entre Ríos 445',
    provincia: 'Catamarca',
  },
  {
    id: 'op-uuid-8q9r0s1t',
    nombre: 'Carolina',
    apellido: 'Silva',
    email: 'carolina.silva@hotel.com',
    telefono: '+54 9 387 555 0018',
    estado: true,
    fechaAlta: '2025-10-22T12:30:00Z',
    rol: 'Operador',
    genero: 'Femenino',
    fechaNacimiento: '1991-07-07T00:00:00Z',
    direccion: 'Pueyrredón 1223',
    provincia: 'Salta',
  },
];

export default function OperadoresPage() {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Estados para ordenamiento
  const [sortField, setSortField] = useState('fechaAlta');
  const [sortDirection, setSortDirection] = useState('desc'); // Por defecto descendente (más nuevo primero)
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    q: '',
    estado: 'Todos',
    fechaDesde: '',
    fechaHasta: ''
  });
  
  // Estados para modal de detalle
  const [selectedOperador, setSelectedOperador] = useState(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  
  // Estados para modal de edición
  const [selectedOperadorParaEditar, setSelectedOperadorParaEditar] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Estados para modal de creación
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Cargar operadores desde la API
  useEffect(() => {
    cargarOperadores();
  }, []);
  
  const cargarOperadores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener token de autenticación
      const { supabase } = await import('../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Debes iniciar sesión para ver los operadores');
        setLoading(false);
        return;
      }

      const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${API}/operadores`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar operadores');
      }

      const { operadores: operadoresData } = await response.json();
      setOperadores(operadoresData);
    } catch (error) {
      console.error('Error al cargar operadores:', error);
      setError(error.message);
      toast.error(error.message || 'Error al cargar operadores', {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cerrar modales con tecla Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isDetalleOpen) {
          setIsDetalleOpen(false);
          setSelectedOperador(null);
        }
        if (isEditOpen) {
          setIsEditOpen(false);
          setSelectedOperadorParaEditar(null);
        }
        if (isCreateOpen) {
          setIsCreateOpen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isDetalleOpen, isEditOpen, isCreateOpen]);
  
  // Función para manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      // Alternar dirección si ya está ordenado por este campo
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, empezar con ascendente excepto para fecha
      setSortField(field);
      setSortDirection(field === 'fechaAlta' ? 'desc' : 'asc');
    }
    setCurrentPage(1); // Volver a la primera página al ordenar
  };
  
  // Handlers de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setCurrentPage(1); // Resetear a página 1
  };

  const handleClearFiltros = () => {
    setFiltros({
      q: '',
      estado: 'Todos',
      fechaDesde: '',
      fechaHasta: ''
    });
    setCurrentPage(1);
  };

  const handleApplyFiltros = () => {
    // Los filtros se aplican automáticamente con useMemo
    setCurrentPage(1);
  };
  
  // Aplicar filtros primero
  const operadoresFiltrados = useMemo(() => {
    return operadores.filter(operador => {
      // Filtro por búsqueda general
      if (filtros.q) {
        const textoLower = filtros.q.toLowerCase();
        const coincide = 
          `${operador.nombre} ${operador.apellido}`.toLowerCase().includes(textoLower) ||
          operador.email.toLowerCase().includes(textoLower) ||
          operador.telefono.toLowerCase().includes(textoLower);
        if (!coincide) return false;
      }
      
      // Filtro por estado
      if (filtros.estado && filtros.estado !== 'Todos') {
        const estadoFiltro = filtros.estado === 'Activo';
        if (operador.estado !== estadoFiltro) return false;
      }
      
      // Filtro por rango de fechas
      if (filtros.fechaDesde) {
        const fechaOperador = new Date(operador.fechaAlta);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaOperador < fechaDesde) return false;
      }
      
      if (filtros.fechaHasta) {
        const fechaOperador = new Date(operador.fechaAlta);
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999);
        if (fechaOperador > fechaHasta) return false;
      }
      
      return true;
    });
  }, [operadores, filtros]);
  
  // Calcular estadísticas basadas en operadores filtrados
  const estadisticas = useMemo(() => {
    const total = operadoresFiltrados.length;
    const activos = operadoresFiltrados.filter(op => op.estado === true).length;
    const inactivos = operadoresFiltrados.filter(op => op.estado === false).length;
    
    return { total, activos, inactivos };
  }, [operadoresFiltrados]);
  
  // Ordenar operadores filtrados
  const operadoresOrdenados = useMemo(() => {
    const sorted = [...operadoresFiltrados].sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === 'nombre') {
        // Ordenar por nombre completo
        aVal = `${a.nombre} ${a.apellido}`.toLowerCase();
        bVal = `${b.nombre} ${b.apellido}`.toLowerCase();
      } else if (sortField === 'estado') {
        // Ordenar por estado (true/false)
        aVal = a.estado ? 1 : 0;
        bVal = b.estado ? 1 : 0;
      } else if (sortField === 'fechaAlta') {
        // Ordenar por fecha
        aVal = new Date(a.fechaAlta).getTime();
        bVal = new Date(b.fechaAlta).getTime();
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
  }, [operadoresFiltrados, sortField, sortDirection]);
  
  // Calcular paginación
  const totalPages = Math.ceil(operadoresOrdenados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const operadoresPaginados = operadoresOrdenados.slice(startIndex, endIndex);
  
  // Handlers de paginación
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  // Formatear fecha
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return {
      fecha: fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      hora: fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };
  
  // Obtener ID corto (primeros 8 caracteres)
  const getIdCorto = (id) => {
    return id.substring(0, 8);
  };
  
  // Handler para toggle de estado con confirmación
  const handleToggleEstado = (operadorId) => {
    const operador = operadores.find(op => op.id === operadorId);
    const nuevoEstado = !operador.estado;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';
    
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>
          ¿Está seguro que desea {mensaje} a {operador.nombre} {operador.apellido}?
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            style={{
              padding: '6px 16px',
              border: '1px solid #d1d5db',
              background: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              
              try {
                // Obtener token de autenticación
                const { supabase } = await import('../../lib/supabase');
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                  toast.error('Debes iniciar sesión');
                  return;
                }

                const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                
                // Llamar a la API para cambiar el estado
                const response = await fetch(`${API}/operadores/${operadorId}/estado`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({ estado: nuevoEstado }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Error al cambiar estado');
                }

                // Actualizar estado localmente
                setOperadores(prevOperadores => 
                  prevOperadores.map(op => 
                    op.id === operadorId 
                      ? { ...op, estado: !op.estado }
                      : op
                  )
                );
                
                // Toast de éxito
                toast.success(
                  `Operador ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
                  {
                    duration: 3000,
                    style: {
                      background: nuevoEstado ? '#d1fae5' : '#fee2e2',
                      color: nuevoEstado ? '#065f46' : '#991b1b',
                    },
                  }
                );
              } catch (error) {
                console.error('Error al cambiar estado:', error);
                toast.error(error.message || 'Error al cambiar estado', {
                  duration: 4000,
                  style: {
                    background: '#fee2e2',
                    color: '#991b1b',
                  },
                });
              }
            }}
            style={{
              padding: '6px 16px',
              border: 'none',
              background: '#9333ea',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };
  
  // Handlers de acciones
  const handleEditar = (operador) => {
    setSelectedOperadorParaEditar(operador);
    setIsEditOpen(true);
  };
  
  const handleVerDetalle = (operador) => {
    setSelectedOperador(operador);
    setIsDetalleOpen(true);
  };
  
  const handleEliminar = (operador) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>
          ¿Está seguro que desea eliminar a {operador.nombre} {operador.apellido}?
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>
          ⚠️ Esta acción eliminará permanentemente al operador y no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            style={{
              padding: '6px 16px',
              border: '1px solid #d1d5db',
              background: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              
              try {
                // Obtener token de autenticación
                const { supabase } = await import('../../lib/supabase');
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                  toast.error('Debes iniciar sesión');
                  return;
                }

                const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                
                // Llamar a la API para eliminar el operador (soft delete)
                const response = await fetch(`${API}/operadores/${operador.id}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Error al eliminar operador');
                }

                // Recargar la lista de operadores
                await cargarOperadores();
                
                // Toast de éxito
                toast.success(
                  `Operador ${operador.nombre} ${operador.apellido} eliminado exitosamente`,
                  {
                    duration: 3000,
                    style: {
                      background: '#fee2e2',
                      color: '#991b1b',
                    },
                  }
                );
              } catch (error) {
                console.error('Error al eliminar operador:', error);
                toast.error(error.message || 'Error al eliminar operador', {
                  duration: 4000,
                  style: {
                    background: '#fee2e2',
                    color: '#991b1b',
                  },
                });
              }
            }}
            style={{
              padding: '6px 16px',
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        maxWidth: '500px',
      },
    });
  };
  
  const handleAgregarOperador = () => {
    setIsCreateOpen(true);
  };
  
  // Handlers para modal de edición
  const handleCancelarEdicion = () => {
    setIsEditOpen(false);
    setSelectedOperadorParaEditar(null);
  };
  
  const handleGuardarEdicion = async (operadorEditado) => {
    try {
      // Obtener token de autenticación
      const { supabase } = await import('../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Debes iniciar sesión para editar operadores');
        return;
      }

      const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // Preparar datos para enviar (excluir campos que no se deben actualizar)
      const { id, email, fechaAlta, rol, ...datosActualizables } = operadorEditado;
      
      // Llamar a la API para actualizar el operador
      const response = await fetch(`${API}/operadores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(datosActualizables),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar operador');
      }

      const { operador } = await response.json();
      
      // Recargar la lista de operadores desde la API
      await cargarOperadores();
      
      // Cerrar modal
      setIsEditOpen(false);
      setSelectedOperadorParaEditar(null);
      
      // Mostrar toast de éxito
      toast.success('Operador actualizado exitosamente', {
        duration: 3000,
        style: {
          background: '#d1fae5',
          color: '#065f46',
        },
      });
      
      console.log('Operador actualizado:', operador);
    } catch (error) {
      console.error('Error al actualizar operador:', error);
      toast.error(error.message || 'Error al actualizar operador', {
        duration: 4000,
        style: {
          background: '#fee2e2',
          color: '#991b1b',
        },
      });
    }
  };
  
  // Handlers para modal de creación
  const handleCancelarCreacion = () => {
    setIsCreateOpen(false);
  };
  
  const handleCrearOperador = async (nuevoOperadorData) => {
    try {
      // Obtener token de autenticación
      const { supabase } = await import('../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Debes iniciar sesión para crear operadores');
        return;
      }

      const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // Llamar a la API para crear el operador
      const response = await fetch(`${API}/operadores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(nuevoOperadorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear operador');
      }

      const { operador } = await response.json();
      
      // Recargar la lista de operadores desde la API
      await cargarOperadores();
      
      // Cerrar modal
      setIsCreateOpen(false);
      
      // Mostrar toast de éxito
      toast.success('Operador creado exitosamente', {
        duration: 3000,
        style: {
          background: '#d1fae5',
          color: '#065f46',
        },
      });
      
      console.log('Nuevo operador creado:', operador);
    } catch (error) {
      console.error('Error al crear operador:', error);
      toast.error(error.message || 'Error al crear operador', {
        duration: 4000,
        style: {
          background: '#fee2e2',
          color: '#991b1b',
        },
      });
    }
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
          <span className={styles.pink}>Operadores</span>
        </div>
        
        {/* Cabecera */}
        <div className={styles.headTop}>
          <div>
            <h2 className={styles.gradientText}>Operadores</h2>
            <p className={styles.muted}>
              Gestión de usuarios operadores del sistema
            </p>
          </div>
          
          {/* Botón Agregar Operador */}
          <div>
            <button 
              className={styles.btnPrimary}
              onClick={handleAgregarOperador}
            >
              + Nuevo Operador
            </button>
          </div>
        </div>
        
        {/* Tarjetas de resumen */}
        <section className={styles.cards}>
          {/* Card Total */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#a855f7',
              '--grad-end': '#9333ea'
            }}
          >
            <div className={styles.cardContent}>
              <p>Total de Operadores</p>
              <h3 className={styles.value}>{estadisticas.total}</h3>
            </div>
            <div className={styles.cardIcon}>👥</div>
          </div>
          
          {/* Card Activos */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#10b981',
              '--grad-end': '#059669',
              animationDelay: '.05s'
            }}
          >
            <div className={styles.cardContent}>
              <p>Activos</p>
              <h3 className={styles.value}>{estadisticas.activos}</h3>
            </div>
            <div className={styles.cardIcon}><FaCheckCircle /></div>
          </div>
          
          {/* Card Inactivos */}
          <div
            className={`${styles.card} ${styles.fadeIn}`}
            style={{
              '--grad-start': '#ef4444',
              '--grad-end': '#dc2626',
              animationDelay: '.1s'
            }}
          >
            <div className={styles.cardContent}>
              <p>Inactivos</p>
              <h3 className={styles.value}>{estadisticas.inactivos}</h3>
            </div>
            <div className={styles.cardIcon}><FaTimesCircle /></div>
          </div>
        </section>
        
        {/* Filtros de búsqueda */}
        <FiltroOperadores
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onClear={handleClearFiltros}
          onApply={handleApplyFiltros}
        />
        
        {/* Tabla de operadores */}
        <section className={styles.tableWrap}>
          <div className={styles.tableHead}>
            <h3>📋 Listado de Operadores</h3>
            <span className={styles.tableInfo}>
              Mostrando {startIndex + 1} - {Math.min(endIndex, operadoresOrdenados.length)} de {operadoresOrdenados.length}
            </span>
          </div>
          
          <div className={styles.scrollX}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortableHeader field="nombre">Nombre</SortableHeader>
                  <th>Contacto</th>
                  <SortableHeader field="estado">Estado</SortableHeader>
                  <SortableHeader field="fechaAlta">Fecha de Registro</SortableHeader>
                  <th>Acciones</th>
                </tr>
              </thead>
              
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      <div className={styles.emptyIcon}>⏳</div>
                      <p>Cargando operadores...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      <div className={styles.emptyIcon}>⚠️</div>
                      <p>{error}</p>
                      <button 
                        onClick={cargarOperadores}
                        className={styles.btnPrimary}
                        style={{ marginTop: '12px' }}
                      >
                        Reintentar
                      </button>
                    </td>
                  </tr>
                ) : operadoresPaginados.length > 0 ? (
                  operadoresPaginados.map((operador) => {
                    const { fecha, hora } = formatearFecha(operador.fechaAlta);
                    const idCorto = getIdCorto(operador.id);
                    
                    return (
                      <tr key={operador.id}>
                        {/* Columna Nombre */}
                        <td>
                          <div className={styles.nombreCell}>
                            <div className={styles.nombrePrincipal} title={operador.id}>
                              {operador.nombre} {operador.apellido}
                            </div>
                            <div className={styles.nombreSecundario}>
                              ID: {idCorto}
                            </div>
                          </div>
                        </td>
                        
                        {/* Columna Contacto */}
                        <td>
                          <div className={styles.contactoCell}>
                            <div className={styles.contactoPrincipal}>
                              {operador.email}
                            </div>
                            <div className={styles.contactoSecundario}>
                              {operador.telefono}
                            </div>
                          </div>
                        </td>
                        
                        {/* Columna Estado */}
                        <td>
                          <span
                            className={`${styles.estadoBadge} ${
                              operador.estado ? styles.estadoActivo : styles.estadoInactivo
                            } ${styles.estadoClickeable}`}
                            onClick={() => handleToggleEstado(operador.id)}
                            title="Click para cambiar estado"
                          >
                            {operador.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        
                        {/* Columna Fecha de Registro */}
                        <td>
                          <div className={styles.fechaCell}>
                            <div className={styles.fechaPrincipal}>{fecha}</div>
                            <div className={styles.fechaSecundaria}>{hora}</div>
                          </div>
                        </td>
                        
                        {/* Columna Acciones */}
                        <td className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.btnEditar}`}
                            onClick={() => handleEditar(operador)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.btnVer}`}
                            onClick={() => handleVerDetalle(operador)}
                            title="Ver detalle"
                          >
                            <FaEye />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.btnEliminar}`}
                            onClick={() => handleEliminar(operador)}
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
                      <div className={styles.emptyIcon}>👥</div>
                      <p>No hay operadores para mostrar</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {operadoresOrdenados.length > 0 && (
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
        
        {/* Modal de Detalle de Operador */}
        {isDetalleOpen && selectedOperador && (
          <div 
            className={styles.modalOverlay}
            onClick={() => {
              setIsDetalleOpen(false);
              setSelectedOperador(null);
            }}
          >
            <div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del Modal */}
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderInfo}>
                  <h2 className={styles.modalTitle}>
                    {selectedOperador.nombre} {selectedOperador.apellido}
                  </h2>
                  <div className={styles.modalHeaderMeta}>
                    <span className={styles.modalRol}>
                      {selectedOperador.rol?.nombre ? 
                        selectedOperador.rol.nombre.charAt(0).toUpperCase() + selectedOperador.rol.nombre.slice(1) 
                        : 'Operador'}
                    </span>
                    <span
                      className={`${styles.estadoBadge} ${
                        selectedOperador.estado ? styles.estadoActivo : styles.estadoInactivo
                      }`}
                    >
                      {selectedOperador.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.modalCloseBtn}
                  onClick={() => {
                    setIsDetalleOpen(false);
                    setSelectedOperador(null);
                  }}
                  title="Cerrar"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Contenido del Modal */}
              <div className={styles.modalBody}>
                {/* Sección 1: Datos de Registro */}
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Datos de registro</h3>
                  <div className={styles.sectionGrid}>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>ID de usuario</label>
                      <code className={styles.fieldValue}>{selectedOperador.id}</code>
                    </div>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Fecha de alta</label>
                      <div className={styles.fieldValue}>
                        <div className={styles.fechaPrincipal}>
                          {formatearFecha(selectedOperador.fechaAlta).fecha}
                        </div>
                        <div className={styles.fechaSecundaria}>
                          {formatearFecha(selectedOperador.fechaAlta).hora} hs
                        </div>
                      </div>
                    </div>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Estado</label>
                      <div className={styles.fieldValue}>
                        {selectedOperador.estado ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sección 2: Contacto */}
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Contacto</h3>
                  <div className={styles.sectionGrid}>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Email</label>
                      <div className={styles.fieldValue}>{selectedOperador.email || 'No especificado'}</div>
                    </div>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Teléfono</label>
                      <div className={styles.fieldValue}>{selectedOperador.telefono || 'No especificado'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Sección 3: Datos Personales */}
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Datos personales</h3>
                  <div className={styles.sectionGrid}>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Género</label>
                      <div className={styles.fieldValue}>{selectedOperador.genero || 'No especificado'}</div>
                    </div>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Fecha de nacimiento</label>
                      <div className={styles.fieldValue}>
                        {selectedOperador.fechaNacimiento ? formatearFecha(selectedOperador.fechaNacimiento).fecha : 'No especificado'}
                      </div>
                    </div>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Dirección</label>
                      <div className={styles.fieldValue}>{selectedOperador.direccion || 'No especificado'}</div>
                    </div>
                    <div className={styles.fieldItem}>
                      <label className={styles.fieldLabel}>Provincia</label>
                      <div className={styles.fieldValue}>{selectedOperador.provincia || 'No especificado'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Edición de Operador */}
        {isEditOpen && selectedOperadorParaEditar && (
          <ModalEdicion
            operador={selectedOperadorParaEditar}
            onCancel={handleCancelarEdicion}
            onSave={handleGuardarEdicion}
          />
        )}
        
        {/* Modal de Creación de Operador */}
        {isCreateOpen && (
          <ModalCreacion
            onCancel={handleCancelarCreacion}
            onCreate={handleCrearOperador}
          />
        )}
      </main>
    </div>
  );
}

// Componente Modal de Edición
function ModalEdicion({ operador, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    ...operador,
    // Convertir fechaNacimiento a formato date input (YYYY-MM-DD)
    fechaNacimiento: operador.fechaNacimiento ? operador.fechaNacimiento.split('T')[0] : '',
    // Extraer el nombre del rol si viene como objeto
    rol: operador.rol?.nombre || operador.rol || 'operador',
  });
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.apellido) {
      toast.error('Nombre y apellido son obligatorios');
      return;
    }
    
    // Convertir fecha de nacimiento de vuelta a ISO string
    const operadorEditado = {
      ...formData,
      fechaNacimiento: formData.fechaNacimiento ? `${formData.fechaNacimiento}T00:00:00Z` : operador.fechaNacimiento,
    };
    
    onSave(operadorEditado);
  };
  
  return (
    <div 
      className={styles.modalOverlay}
      onClick={onCancel}
    >
      <div 
        className={`${styles.modalContent} ${styles.modalEditContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderInfo}>
            <h2 className={styles.modalTitle}>Editar operador</h2>
            <code className={styles.modalIdText}>ID: {operador.id}</code>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={onCancel}
            title="Cerrar"
            type="button"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Sección 1: Datos de Cuenta */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>Datos de cuenta</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Rol <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value="Operador"
                    disabled
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                    title="El rol no se puede modificar"
                  />
                  <small style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                    El rol no se puede modificar
                  </small>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estado</label>
                  <div className={styles.switchContainer}>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={formData.estado}
                        onChange={(e) => handleChange('estado', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                    <span className={styles.switchLabel}>
                      {formData.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de alta</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={new Date(operador.fechaAlta).toLocaleDateString('es-AR')}
                    disabled
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Sección 2: Contacto */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>Contacto</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={operador.email || 'No especificado'}
                    disabled
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                    title="El email no se puede modificar"
                  />
                  <small style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                    El email no se puede modificar
                  </small>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Teléfono</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Sección 3: Datos Personales */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>Datos personales</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nombre <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Apellido <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Género</label>
                  <select
                    className={styles.formSelect}
                    value={formData.genero}
                    onChange={(e) => handleChange('genero', e.target.value)}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de nacimiento</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Dirección</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Provincia</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.provincia}
                    onChange={(e) => handleChange('provincia', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer con botones */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Función para calcular fuerza de contraseña
const getPasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return { level: 0, text: "Muy débil", width: "25%", color: "#ef4444" };
  }

  let types = 0;
  if (/[a-z]/.test(password)) types++;
  if (/[A-Z]/.test(password)) types++;
  if (/\d/.test(password)) types++;
  if (/[^a-zA-Z0-9]/.test(password)) types++;

  if (password.length >= 10 && types >= 3) {
    return { level: 3, text: "Fuerte", width: "100%", color: "#059669" };
  }
  if (password.length >= 8 && types >= 2) {
    return { level: 2, text: "Media", width: "66%", color: "#eab308" };
  }
  return { level: 1, text: "Débil", width: "33%", color: "#f59e0b" };
};

// Componente Modal de Creación
function ModalCreacion({ onCancel, onCreate }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rol: 'operador',
    estado: true,
    genero: 'Masculino',
    fechaNacimiento: '',
    direccion: '',
    provincia: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  // Cargar roles desde la BD
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API}/roles`);
        
        if (response.ok) {
          const data = await response.json();
          // Filtrar solo operador y administrador (excluir cliente)
          const rolesFiltrados = data.roles.filter(r => r.id !== 1);
          setRoles(rolesFiltrados);
        }
      } catch (error) {
        console.error('Error al cargar roles:', error);
        // Fallback a roles por defecto
        setRoles([
          { id: 2, nombre: 'operador' },
          { id: 3, nombre: 'administrador' }
        ]);
      } finally {
        setLoadingRoles(false);
      }
    };
    
    cargarRoles();
  }, []);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.apellido || !formData.email) {
      toast.error('Nombre, apellido y email son obligatorios');
      return;
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('El email no es válido');
      return;
    }
    
    // Validación de contraseña
    if (!formData.password) {
      toast.error('La contraseña es obligatoria');
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('La contraseña debe tener mayúscula, minúscula y dígito');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    // Convertir fecha de nacimiento a ISO string si existe y remover confirmPassword
    const { confirmPassword, ...operadorData } = {
      ...formData,
      fechaNacimiento: formData.fechaNacimiento ? `${formData.fechaNacimiento}T00:00:00Z` : '',
    };
    
    onCreate(operadorData);
  };
  
  return (
    <div 
      className={styles.modalOverlay}
      onClick={onCancel}
    >
      <div 
        className={`${styles.modalContent} ${styles.modalEditContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderInfo}>
            <h2 className={styles.modalTitle}>Nuevo operador</h2>
            <p className={styles.modalSubtitle}>Complete los datos del nuevo operador</p>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={onCancel}
            title="Cerrar"
            type="button"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Sección 1: Datos de Cuenta */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>Datos de cuenta</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Rol <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    value={formData.rol}
                    onChange={(e) => handleChange('rol', e.target.value)}
                    required
                    disabled={loadingRoles}
                  >
                    {loadingRoles ? (
                      <option>Cargando roles...</option>
                    ) : (
                      roles.map(rol => (
                        <option key={rol.id} value={rol.nombre}>
                          {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estado</label>
                  <div className={styles.switchContainer}>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={formData.estado}
                        onChange={(e) => handleChange('estado', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                    <span className={styles.switchLabel}>
                      {formData.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección 2: Contacto */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>Contacto</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="ejemplo@hotel.com"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Teléfono</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="+54 9 387 555 0000"
                  />
                </div>
              </div>
            </div>
            
            {/* Sección 2.5: Seguridad */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>Seguridad</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Contraseña <span className={styles.required}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}
                      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{
                        height: '4px',
                        background: '#e5e7eb',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginBottom: '4px'
                      }}>
                        <div style={{
                          height: '100%',
                          width: getPasswordStrength(formData.password).width,
                          backgroundColor: getPasswordStrength(formData.password).color,
                          transition: 'all 0.3s ease'
                        }} />
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: getPasswordStrength(formData.password).color,
                        margin: 0
                      }}>
                        Fuerza: {getPasswordStrength(formData.password).text}
                      </p>
                    </div>
                  )}
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                    Mínimo 8 caracteres, debe incluir mayúscula, minúscula y dígito
                  </p>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Confirmar contraseña <span className={styles.required}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}
                      title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>
                      Las contraseñas no coinciden
                    </p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px', marginBottom: 0 }}>
                      ✓ Las contraseñas coinciden
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sección 3: Datos Personales */}
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>Datos personales</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nombre <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Juan"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Apellido <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    placeholder="Pérez"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Género</label>
                  <select
                    className={styles.formSelect}
                    value={formData.genero}
                    onChange={(e) => handleChange('genero', e.target.value)}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de nacimiento</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Dirección</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Av. Siempre Viva 742"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Provincia</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.provincia}
                    onChange={(e) => handleChange('provincia', e.target.value)}
                    placeholder="Salta"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer con botones */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
            >
              Crear operador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
