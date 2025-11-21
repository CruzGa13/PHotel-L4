import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSave, FaTimes, FaBed, FaDollarSign, FaCheckCircle, FaImage, FaArrowLeft, FaEdit, FaTrash, FaInfoCircle, FaClipboardList } from 'react-icons/fa';
import { MdKingBed } from 'react-icons/md';
import AmenidadesSelector from '../../components/TiposHabitacion/AmenidadesSelector/AmenidadesSelectorNuevo';
import ImagenesUploader from '../../components/TiposHabitacion/ImagenesUploader/ImagenesUploader';
import ModalHabitacion from '../../components/TiposHabitacion/ModalHabitacion/ModalHabitacion';
import { uploadMultipleImages, deleteImage } from '../../services/imageService';
import styles from './EditarTipoHabitacion.module.css';

// Mock de categorías
const categoriasMock = [
  { id: 1, nombre: 'Estándar' },
  { id: 2, nombre: 'Premium' },
  { id: 3, nombre: 'Deluxe' },
  { id: 4, nombre: 'Suite' },
  { id: 5, nombre: 'Ejecutiva' }
];

// Mock de ocupaciones
const ocupacionesMock = [
  { id: 1, nombre: '1 adulto', capacidad: 1, descripcionCamas: '1 cama individual' },
  { id: 2, nombre: '2 adultos', capacidad: 2, descripcionCamas: '1 cama matrimonial o 2 camas individuales' },
  { id: 3, nombre: '2 adultos + 1 niño', capacidad: 3, descripcionCamas: '1 cama matrimonial + 1 cama individual' },
  { id: 4, nombre: '2 adultos + 2 niños', capacidad: 4, descripcionCamas: '1 cama king + 2 camas individuales' },
  { id: 5, nombre: '4 adultos', capacidad: 4, descripcionCamas: '2 camas matrimoniales' },
  { id: 6, nombre: 'Hasta 5 huéspedes', capacidad: 5, descripcionCamas: '1 cama king + 2 camas individuales + 1 sofá cama' },
  { id: 7, nombre: 'Hasta 6 huéspedes', capacidad: 6, descripcionCamas: '2 camas king + 2 camas individuales' }
];

// Mock de amenidades disponibles
const amenidadesDisponiblesMock = [
  { id: 1, nombre: 'Wi-Fi', icono: '📶', categoria: 'Tecnología' },
  { id: 2, nombre: 'TV Cable', icono: '📺', categoria: 'Tecnología' },
  { id: 3, nombre: 'Smart TV', icono: '📺', categoria: 'Tecnología' },
  { id: 4, nombre: 'Aire acondicionado', icono: '❄️', categoria: 'Clima' },
  { id: 5, nombre: 'Calefacción', icono: '🔥', categoria: 'Clima' },
  { id: 6, nombre: 'Minibar', icono: '🍷', categoria: 'Servicios' },
  { id: 7, nombre: 'Caja fuerte', icono: '🔒', categoria: 'Seguridad' },
  { id: 8, nombre: 'Secador de pelo', icono: '💨', categoria: 'Baño' },
  { id: 9, nombre: 'Cocina equipada', icono: '🍳', categoria: 'Servicios' },
  { id: 10, nombre: 'Balcón privado', icono: '🏞️', categoria: 'Espacios' },
  { id: 11, nombre: 'Cafetera', icono: '☕', categoria: 'Servicios' },
  { id: 12, nombre: 'Plancha', icono: '👔', categoria: 'Servicios' },
  { id: 13, nombre: 'Escritorio', icono: '🖊️', categoria: 'Mobiliario' },
  { id: 14, nombre: 'Sofá cama', icono: '🛋️', categoria: 'Mobiliario' },
  { id: 15, nombre: 'Jacuzzi', icono: '🛁', categoria: 'Baño' },
  { id: 16, nombre: 'Bañera', icono: '🛁', categoria: 'Baño' },
  { id: 17, nombre: 'Ducha', icono: '🚿', categoria: 'Baño' },
  { id: 18, nombre: 'Artículos de tocador', icono: '🧴', categoria: 'Baño' },
  { id: 19, nombre: 'Albornoz', icono: '👘', categoria: 'Baño' },
  { id: 20, nombre: 'Pantuflas', icono: '🥿', categoria: 'Baño' },
  { id: 21, nombre: 'Room service', icono: '🍽️', categoria: 'Servicios' },
  { id: 22, nombre: 'Servicio de limpieza', icono: '🧹', categoria: 'Servicios' },
  { id: 23, nombre: 'Teléfono', icono: '☎️', categoria: 'Tecnología' },
  { id: 24, nombre: 'Despertador', icono: '⏰', categoria: 'Servicios' },
  { id: 25, nombre: 'Ventilador', icono: '🌀', categoria: 'Clima' },
  { id: 26, nombre: 'Terraza', icono: '🌅', categoria: 'Espacios' },
  { id: 27, nombre: 'Vista al mar', icono: '🌊', categoria: 'Vistas' },
  { id: 28, nombre: 'Vista a la montaña', icono: '⛰️', categoria: 'Vistas' },
  { id: 29, nombre: 'Vista al jardín', icono: '🌳', categoria: 'Vistas' },
  { id: 30, nombre: 'Acceso para discapacitados', icono: '♿', categoria: 'Accesibilidad' }
];

// Mock de tipo de habitación (simula datos de API)
const getTipoHabitacionMock = (id) => {
  const tipos = {
    1: {
      id: 1,
      nombre: "Estándar Doble",
      descripcion: "Habitación cómoda y acogedora diseñada para dos personas. Cuenta con todas las comodidades necesarias para una estadía placentera, incluyendo baño privado, escritorio y zona de estar.",
      tarifaBase: 45000,
      categoriaId: 1,
      ocupacionId: 2,
      superficie: 25,
      vista: "Vista a la ciudad",
      politicas: "Check-in: 15:00 hs | Check-out: 11:00 hs | Cancelación gratuita hasta 24 hs antes",
      amenidadesIds: [1, 2, 4, 6, 7, 8],
      imagenes: [
        { id: 1, url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400", descripcion: "Vista general" },
        { id: 2, url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400", descripcion: "Baño" }
      ],
      habitacionesVinculadas: [
        { id: 1, numero: "201", piso: 2, estado: "Disponible" },
        { id: 2, numero: "202", piso: 2, estado: "Ocupada" },
        { id: 3, numero: "301", piso: 3, estado: "Disponible" },
        { id: 4, numero: "302", piso: 3, estado: "Limpieza" },
        { id: 5, numero: "401", piso: 4, estado: "Disponible" }
      ]
    },
    2: {
      id: 2,
      nombre: "Suite Familiar",
      descripcion: "Espaciosa suite ideal para familias, con living independiente y dos dormitorios separados.",
      tarifaBase: 90000,
      categoriaId: 2,
      ocupacionId: 4,
      superficie: 55,
      vista: "Vista al jardín",
      politicas: "Check-in: 14:00 hs | Check-out: 12:00 hs | Cancelación gratuita hasta 48 hs antes",
      amenidadesIds: [1, 3, 4, 9, 10, 7, 11, 12],
      imagenes: [
        { id: 3, url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", descripcion: "Living" },
        { id: 4, url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400", descripcion: "Dormitorio principal" }
      ],
      habitacionesVinculadas: [
        { id: 6, numero: "501", piso: 5, estado: "Disponible" },
        { id: 7, numero: "502", piso: 5, estado: "Ocupada" },
        { id: 8, numero: "601", piso: 6, estado: "Disponible" }
      ]
    }
  };
  return tipos[id] || tipos[1];
};

export default function EditarTipoHabitacion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    ocupacionId: '',
    capacidad: '',
    descripcionCamas: '',
    superficie: '',
    tarifaBase: ''
  });
  
  const [amenidadesSeleccionadas, setAmenidadesSeleccionadas] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);  // ✅ Estado para imágenes a eliminar
  const [habitacionesVinculadas, setHabitacionesVinculadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState('informacion');
  
  // Estados para datos del backend
  const [categorias, setCategorias] = useState([]);
  const [ocupaciones, setOcupaciones] = useState([]);
  const [amenidadesDisponibles, setAmenidadesDisponibles] = useState([]);
  
  // Paginación de habitaciones
  const [paginaHabitaciones, setPaginaHabitaciones] = useState(1);
  const habitacionesPorPagina = 5;
  
  // Modal de habitaciones
  const [modalHabitacionOpen, setModalHabitacionOpen] = useState(false);
  const [habitacionEditando, setHabitacionEditando] = useState(null);
  
  // Debug: Monitorear cambios en amenidadesSeleccionadas
  useEffect(() => {
    console.log('🔄 amenidadesSeleccionadas cambió:', amenidadesSeleccionadas);
  }, [amenidadesSeleccionadas]);
  
  // Cargar datos del tipo de habitación
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar datos en paralelo
        const [tipoRes, categoriasRes, ocupacionesRes, amenidadesRes, habitacionesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/tipos-habitacion/${id}`),
          axios.get(`${API_BASE_URL}/categorias`),
          axios.get(`${API_BASE_URL}/ocupaciones/completas`),
          axios.get(`${API_BASE_URL}/amenidades/completas`),
          axios.get(`${API_BASE_URL}/habitaciones/tipo/${id}`) // ✅ Cargar habitaciones del tipo
        ]);
        
        const tipo = tipoRes.data;
        console.log('✅ Tipo de habitación cargado:', tipo);
        console.log('📋 Categorías cargadas:', categoriasRes.data);
        console.log('👥 Ocupaciones cargadas:', ocupacionesRes.data);
        console.log('✨ Amenidades disponibles:', amenidadesRes.data);
        
        // Guardar categorías, ocupaciones y amenidades
        setCategorias(categoriasRes.data);
        setOcupaciones(ocupacionesRes.data);
        setAmenidadesDisponibles(amenidadesRes.data);
        
        // Encontrar ocupación para obtener capacidad y descripción de camas
        const ocupacion = ocupacionesRes.data.find(o => o.id === tipo.ocupacion?.id);
        console.log('🔍 Ocupación encontrada:', ocupacion);
        console.log('🔍 ID de ocupación del tipo:', tipo.ocupacion?.id);
        
        setFormData({
          nombre: tipo.nombre || '',
          descripcion: tipo.descripcion || '',
          categoriaId: tipo.categoria?.id || '',
          ocupacionId: tipo.ocupacion?.id || '',
          capacidad: ocupacion?.capacidad || '',
          descripcionCamas: ocupacion?.descripcionCamas || '',
          superficie: tipo.superficie || '',
          tarifaBase: tipo.tarifaBase || ''
        });
        
        console.log('📝 FormData seteado:', {
          categoriaId: tipo.categoria?.id,
          ocupacionId: tipo.ocupacion?.id
        });
        
        // Amenidades: extraer solo los IDs de las amenidades vinculadas
        const amenidadesVinculadas = tipo.amenidades || [];
        console.log('🔍 Estructura de amenidades recibidas:', amenidadesVinculadas);
        console.log('🔍 Primera amenidad (para ver estructura):', amenidadesVinculadas[0]);
        
        const amenidadesIds = amenidadesVinculadas.map(amenidad => {
          // Verificar la estructura real del objeto
          console.log('🔍 Procesando amenidad:', amenidad);
          
          // El backend retorna directamente el objeto amenidad
          // Si tiene la propiedad 'id', usarla directamente
          if (amenidad && amenidad.id) {
            return amenidad.id;
          }
          
          // Si tiene amenidad.amenidad.id (estructura anidada)
          if (amenidad && amenidad.amenidad && amenidad.amenidad.id) {
            return amenidad.amenidad.id;
          }
          
          console.error('❌ No se pudo extraer ID de:', amenidad);
          return null;
        }).filter(id => id !== null); // Filtrar nulls
        
        console.log('✨ Amenidades vinculadas al tipo (completas):', amenidadesVinculadas);
        console.log('✨ IDs extraídos para selección:', amenidadesIds);
        console.log('🔵 Estado ANTES de setear:', amenidadesSeleccionadas);
        
        setAmenidadesSeleccionadas(amenidadesIds);
        
        console.log('🟢 Estado DESPUÉS de setear:', amenidadesIds);
        
        console.log('📸 Imágenes recibidas del backend:', tipo.imagenes);
        console.log('📸 Cantidad de imágenes:', tipo.imagenes?.length || 0);
        console.log('📸 Primera imagen (estructura):', tipo.imagenes?.[0]);
        
        setImagenes(tipo.imagenes || []);
        
        // Habitaciones vinculadas
        const habitaciones = habitacionesRes.data || [];
        console.log('🏨 Habitaciones vinculadas cargadas:', habitaciones.length);
        setHabitacionesVinculadas(habitaciones);
        
        console.log('✅ Datos cargados correctamente');
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        toast.error('Error al cargar los datos del tipo de habitación');
        navigate('/crud-habitaciones');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [id, navigate, API_BASE_URL]);
  
  // Obtener ocupación seleccionada
  const ocupacionSeleccionada = ocupaciones.find(o => o.id === parseInt(formData.ocupacionId));
  
  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia la ocupación, actualizar capacidad y descripcionCamas
    if (name === 'ocupacionId') {
      const ocupacion = ocupaciones.find(o => o.id === parseInt(value));
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        capacidad: ocupacion?.capacidad || '',
        descripcionCamas: ocupacion?.descripcionCamas || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleEditarHabitacion = (habitacion) => {
    console.log('✏️ Abriendo modal para editar habitación:', habitacion);
    setHabitacionEditando(habitacion);
    setModalHabitacionOpen(true);
  };
  
  const handleEliminarHabitacion = async (habitacion) => {
    console.log('🗑️ Solicitando eliminación de habitación:', habitacion);
    
    if (!window.confirm(`¿Está seguro de eliminar la habitación ${habitacion.numero}?\n\nEsta acción no se puede deshacer.`)) {
      console.log('⚠️ Eliminación cancelada');
      return;
    }
    
    try {
      console.log('📤 Eliminando habitación ID', habitacion.id);
      
      const response = await axios.delete(`${API_BASE_URL}/habitaciones/${habitacion.id}`);
      
      console.log('✅ Habitación eliminada:', response.data);
      
      // Recargar habitaciones
      const habitacionesRes = await axios.get(`${API_BASE_URL}/habitaciones/tipo/${id}`);
      setHabitacionesVinculadas(habitacionesRes.data);
      
      toast.success(`Habitación ${habitacion.numero} eliminada exitosamente`);
    } catch (error) {
      console.error('❌ Error al eliminar habitación:', error);
      const mensaje = error.response?.data?.error || 'Error al eliminar la habitación';
      toast.error(mensaje);
    }
  };
  
  const handleAgregarHabitacion = () => {
    console.log('➕ Abriendo modal para crear habitación...');
    setHabitacionEditando(null);
    setModalHabitacionOpen(true);
  };
  
  const handleSubmitHabitacion = async (formData) => {
    console.log('🎯 [handleSubmitHabitacion] Iniciando...', formData);
    
    try {
      if (habitacionEditando) {
        // EDITAR
        console.log('✏️ [EDITAR] Actualizando habitación ID', habitacionEditando.id);
        console.log('📋 [EDITAR] Datos:', formData);
        console.log('🌐 [EDITAR] URL:', `${API_BASE_URL}/habitaciones/${habitacionEditando.id}`);
        
        const response = await axios.put(
          `${API_BASE_URL}/habitaciones/${habitacionEditando.id}`,
          formData
        );
        
        console.log('✅ [EDITAR] Respuesta del servidor:', response.data);
        console.log('✅ [EDITAR] Status:', response.status);
        toast.success(`Habitación ${formData.numero} actualizada exitosamente`);
      } else {
        // CREAR
        console.log('➕ [CREAR] Creando nueva habitación');
        console.log('📋 [CREAR] Datos:', formData);
        console.log('🌐 [CREAR] URL:', `${API_BASE_URL}/habitaciones`);
        
        const response = await axios.post(
          `${API_BASE_URL}/habitaciones`,
          formData
        );
        
        console.log('✅ [CREAR] Respuesta del servidor:', response.data);
        console.log('✅ [CREAR] Status:', response.status);
        console.log('✅ [CREAR] Habitación creada con ID:', response.data.data?.id);
        toast.success(`Habitación ${formData.numero} creada exitosamente`);
      }
      
      // Recargar habitaciones
      console.log('🔄 [RECARGAR] Obteniendo habitaciones del tipo', id);
      console.log('🌐 [RECARGAR] URL:', `${API_BASE_URL}/habitaciones/tipo/${id}`);
      
      const habitacionesRes = await axios.get(`${API_BASE_URL}/habitaciones/tipo/${id}`);
      
      console.log('✅ [RECARGAR] Habitaciones obtenidas:', habitacionesRes.data);
      console.log('✅ [RECARGAR] Total:', habitacionesRes.data.length);
      
      setHabitacionesVinculadas(habitacionesRes.data);
      
      // Cerrar modal
      console.log('🚪 [MODAL] Cerrando modal');
      setModalHabitacionOpen(false);
      setHabitacionEditando(null);
      
    } catch (error) {
      console.error('❌ [ERROR] Error completo:', error);
      console.error('❌ [ERROR] Response:', error.response);
      console.error('❌ [ERROR] Data:', error.response?.data);
      console.error('❌ [ERROR] Status:', error.response?.status);
      const mensaje = error.response?.data?.error || 'Error al guardar la habitación';
      toast.error(mensaje);
    }
  };
  
  // Calcular habitaciones paginadas
  const indexUltimaHab = paginaHabitaciones * habitacionesPorPagina;
  const indexPrimeraHab = indexUltimaHab - habitacionesPorPagina;
  const habitacionesPaginadas = habitacionesVinculadas.slice(indexPrimeraHab, indexUltimaHab);
  const totalPaginasHab = Math.ceil(habitacionesVinculadas.length / habitacionesPorPagina);
  
  const handleVolver = () => {
    navigate('/crud-habitaciones');
  };
  
  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
      navigate('/crud-habitaciones');
    }
  };
  
  const handleGuardar = async () => {
    console.log('🔍 Iniciando validaciones...');
    
    // Validaciones
    if (!formData.nombre.trim()) {
      console.log('❌ Validación fallida: Nombre vacío');
      toast.error('El nombre es obligatorio');
      return;
    }
    
    if (!formData.descripcion.trim()) {
      console.log('❌ Validación fallida: Descripción vacía');
      toast.error('La descripción es obligatoria');
      return;
    }
    
    if (!formData.categoriaId) {
      console.log('❌ Validación fallida: Categoría no seleccionada');
      toast.error('Debes seleccionar una categoría');
      return;
    }
    
    if (!formData.ocupacionId) {
      console.log('❌ Validación fallida: Ocupación no seleccionada');
      toast.error('Debes seleccionar una ocupación');
      return;
    }
    
    if (!formData.tarifaBase || formData.tarifaBase <= 0) {
      console.log('❌ Validación fallida: Tarifa inválida');
      toast.error('La tarifa base debe ser mayor a 0');
      return;
    }
    
    // Validación de amenidades (opcional pero recomendado)
    if (amenidadesSeleccionadas.length === 0) {
      console.log('⚠️ Advertencia: No se seleccionaron amenidades');
      const confirmar = window.confirm('¿Estás seguro de guardar sin amenidades?');
      if (!confirmar) {
        console.log('❌ Guardado cancelado por usuario');
        return;
      }
    }
    
    // Validación de imágenes (opcional pero recomendado)
    if (imagenes.length === 0) {
      console.log('⚠️ Advertencia: No se agregaron imágenes');
      const confirmar = window.confirm('¿Estás seguro de guardar sin imágenes?');
      if (!confirmar) {
        console.log('❌ Guardado cancelado por usuario');
        return;
      }
    }
    
    console.log('✅ Todas las validaciones pasaron');
    console.log('📊 Resumen de datos:', {
      nombre: formData.nombre,
      categoria: formData.categoriaId,
      ocupacion: formData.ocupacionId,
      tarifa: formData.tarifaBase,
      amenidades: amenidadesSeleccionadas.length,
      imagenes: imagenes.length
    });
    
    try {
      setGuardando(true);
      console.log('🚀 Iniciando proceso de guardado...');
      
      // ========== PASO 1: PROCESAR IMÁGENES ==========
      console.log(' Procesando imágenes...');
      console.log(' Imágenes actuales:', imagenes.length);
      console.log(' Imágenes a eliminar:', imagenesAEliminar.length);
      
      // Separar imágenes nuevas (ID string temporal) de las existentes (ID numérico de BD)
      const imagenesNuevasArchivos = imagenes.filter(img => typeof img.id === 'string' && img.file);
      const imagenesExistentes = imagenes.filter(img => typeof img.id === 'number');
      
      console.log(' Imágenes nuevas a subir:', imagenesNuevasArchivos.length);
      console.log(' Imágenes existentes a mantener:', imagenesExistentes.length);
      console.log(' Detalle imágenes nuevas:', imagenesNuevasArchivos.map(img => ({ id: img.id, file: img.file?.name })));
      console.log(' Detalle imágenes existentes:', imagenesExistentes.map(img => ({ id: img.id, url: img.url })));
      
      let imagenesSubidas = [];
      
      // Subir imágenes nuevas a Supabase
      if (imagenesNuevasArchivos.length > 0) {
        console.log(' Subiendo imágenes a Supabase...');
        console.log('⬆️ Subiendo imágenes a Supabase...');
        try {
          const archivos = imagenesNuevasArchivos.map(img => img.file);
          const categoriaId = parseInt(formData.categoriaId);
          
          const resultados = await uploadMultipleImages(archivos, categoriaId);
          
          imagenesSubidas = resultados.map((resultado, index) => ({
            url: resultado.url,
            descripcion: imagenesNuevasArchivos[index].descripcion || null
          }));
          
          console.log('✅ Imágenes subidas exitosamente:', imagenesSubidas.length);
          console.log('🔗 URLs generadas:', imagenesSubidas.map(img => img.url));
        } catch (error) {
          console.error('❌ Error al subir imágenes:', error);
          toast.error('Error al subir las imágenes');
          throw error;
        }
      }
      
      // Eliminar imágenes de Supabase (las marcadas para eliminar)
      if (imagenesAEliminar.length > 0) {
        console.log('🗑️ Eliminando imágenes de Supabase...');
        for (const imagen of imagenesAEliminar) {
          if (imagen.url) {
            try {
              await deleteImage(imagen.url);
              console.log('✅ Imagen eliminada de Supabase:', imagen.url);
            } catch (error) {
              console.error('⚠️ Error al eliminar imagen de Supabase:', error);
              // Continuar aunque falle la eliminación
            }
          }
        }
      }
      
      // ========== PASO 2: PREPARAR DATOS ==========
      console.log('📦 Preparando datos para enviar al backend...');
      
      const datosActualizar = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoriaId: parseInt(formData.categoriaId),
        ocupacionId: parseInt(formData.ocupacionId),
        tarifaBase: parseFloat(formData.tarifaBase),
        superficie: formData.superficie ? parseFloat(formData.superficie) : null,
        amenidadesIds: amenidadesSeleccionadas,
        imagenesNuevas: imagenesSubidas,  // URLs de imágenes subidas a Supabase
        imagenesEliminar: imagenesAEliminar.map(img => img.id).filter(id => id)  // IDs de BD
      };
      
      console.log('📤 Datos a enviar:', {
        nombre: datosActualizar.nombre,
        categoriaId: datosActualizar.categoriaId,
        ocupacionId: datosActualizar.ocupacionId,
        amenidadesIds: datosActualizar.amenidadesIds.length,
        imagenesNuevas: datosActualizar.imagenesNuevas.length,
        imagenesEliminar: datosActualizar.imagenesEliminar.length
      });
      
      // ========== PASO 3: ENVIAR AL BACKEND ==========
      console.log('🌐 Enviando actualización al backend...');
      
      const response = await axios.put(
        `${API_BASE_URL}/tipos-habitacion/${id}`,
        datosActualizar
      );
      
      console.log('✅ Respuesta del servidor:', response.data);
      console.log('✅ Amenidades guardadas:', response.data.data?.amenidades?.length || 0);
      console.log('✅ Imágenes guardadas:', response.data.data?.imagenes?.length || 0);
      
      toast.success('Tipo de habitación actualizado exitosamente');
      navigate('/crud-habitaciones');
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      const mensaje = error.response?.data?.error || 'Error al guardar los cambios';
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };
  
  const formatearPrecio = (precio) => {
    if (!precio) return '';
    return `$ ${parseInt(precio).toLocaleString('es-AR')}`;
  };
  
  const getEstadoBadge = (estado) => {
    const estados = {
      'Disponible': { color: '#10b981', bg: '#d1fae5' },
      'Ocupada': { color: '#ef4444', bg: '#fee2e2' },
      'Mantenimiento': { color: '#f59e0b', bg: '#fef3c7' },
      'Limpieza': { color: '#3b82f6', bg: '#dbeafe' }
    };
    return estados[estado] || estados['Disponible'];
  };
  
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.containerMain}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.page}>
      <main className={styles.containerMain}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumb}>
          <span>Inicio</span>
          <span className={styles.sep}>›</span>
          <span onClick={handleVolver} style={{ cursor: 'pointer', color: '#0c3f32' }}>Tipos de habitación</span>
          <span className={styles.sep}>›</span>
          <span className={styles.pink}>Editar</span>
        </div>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Editar Tipo de Habitación</h1>
            <p className={styles.subtitle}>Modificá los datos del tipo de habitación</p>
          </div>
          <button className={styles.btnVolver} onClick={handleVolver}>
            <FaArrowLeft /> Volver a tipos de habitación
          </button>
        </div>
        
        {/* Tabs de navegación */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${tabActiva === 'informacion' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('informacion')}
          >
            <FaInfoCircle /> Información General
          </button>
          <button 
            className={`${styles.tab} ${tabActiva === 'amenidades' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('amenidades')}
          >
            <FaCheckCircle /> Amenidades ({amenidadesSeleccionadas.length})
          </button>
          <button 
            className={`${styles.tab} ${tabActiva === 'imagenes' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('imagenes')}
          >
            <FaImage /> Imágenes ({imagenes.length})
          </button>
          <button 
            className={`${styles.tab} ${tabActiva === 'habitaciones' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('habitaciones')}
          >
            <FaClipboardList /> Habitaciones ({habitacionesVinculadas.length})
          </button>
        </div>
        
        {/* Contenido de tabs */}
        <div className={styles.formContainer}>
          {/* Tab: Información General */}
          {tabActiva === 'informacion' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaBed /> Datos Generales
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <label className={styles.label}>
                  Nombre <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ej: Suite Familiar"
                />
              </div>
              
              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <label className={styles.label}>
                  Descripción <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Describe las características principales de este tipo de habitación..."
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Categoría <span className={styles.required}>*</span>
                </label>
                <select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Ocupación <span className={styles.required}>*</span>
                </label>
                <select
                  name="ocupacionId"
                  value={formData.ocupacionId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Seleccionar ocupación</option>
                  {ocupaciones.map(oc => (
                    <option key={oc.id} value={oc.id}>{oc.nombre}</option>
                  ))}
                </select>
              </div>
              
              {/* Campos editables de capacidad */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Capacidad (personas)</label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ej: 2"
                  min="1"
                />
              </div>
              
              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <label className={styles.label}>Descripción de camas</label>
                <input
                  type="text"
                  name="descripcionCamas"
                  value={formData.descripcionCamas}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ej: 1 cama matrimonial o 2 camas individuales"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Superficie (m²)</label>
                <input
                  type="number"
                  name="superficie"
                  value={formData.superficie}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Ej: 35"
                  min="0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tarifa base <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWithPrefix}>
                  <span className={styles.prefix}>$</span>
                  <input
                    type="number"
                    name="tarifaBase"
                    value={formData.tarifaBase}
                    onChange={handleInputChange}
                    className={styles.inputPrefixed}
                    placeholder="45000"
                    min="0"
                    step="1000"
                  />
                </div>
                {formData.tarifaBase && (
                  <span className={styles.helpText}>
                    {formatearPrecio(formData.tarifaBase)} / noche
                  </span>
                )}
              </div>
            </div>
          </section>
          )}
          
          {/* Tab: Amenidades */}
          {tabActiva === 'amenidades' && (
          <section className={styles.section}>
            <AmenidadesSelector
              amenidadesDisponibles={amenidadesDisponibles}
              amenidadesSeleccionadas={amenidadesSeleccionadas}
              onChange={setAmenidadesSeleccionadas}
            />
          </section>
          )}
          
          {/* Tab: Imágenes */}
          {tabActiva === 'imagenes' && (
          <section className={styles.section}>
            <ImagenesUploader
              imagenes={imagenes}
              onChange={setImagenes}
              imagenesAEliminar={imagenesAEliminar}
              setImagenesAEliminar={setImagenesAEliminar}
            />
          </section>
          )}
          
          {/* Tab: Habitaciones Vinculadas */}
          {tabActiva === 'habitaciones' && (
          <section className={styles.section}>
            <div className={styles.habitacionesHeader}>
              <p className={styles.totalHabitaciones}>
                Total: <strong>{habitacionesVinculadas.length} habitaciones</strong>
              </p>
              <button className={styles.btnAgregarHab} onClick={handleAgregarHabitacion}>
                <FaBed /> Agregar habitación
              </button>
            </div>
            
            <div className={styles.habitacionesInfo}>
              {habitacionesVinculadas.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Piso</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {habitacionesPaginadas.map((hab) => {
                        const estadoBadge = getEstadoBadge(hab.estado);
                        return (
                          <tr key={hab.id}>
                            <td className={styles.numeroCell}>{hab.numero}</td>
                            <td>{hab.piso}</td>
                            <td>
                              <span 
                                className={styles.estadoBadge}
                                style={{ 
                                  backgroundColor: estadoBadge.bg, 
                                  color: estadoBadge.color 
                                }}
                              >
                                {hab.estado}
                              </span>
                            </td>
                            <td className={styles.actionsCell}>
                              <button
                                className={`${styles.actionBtn} ${styles.btnEditar}`}
                                onClick={() => handleEditarHabitacion(hab)}
                                title="Editar habitación"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.btnEliminar}`}
                                onClick={() => handleEliminarHabitacion(hab)}
                                title="Desvincular habitación"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No hay habitaciones vinculadas a este tipo</p>
                </div>
              )}
              
              {/* Paginación */}
              {habitacionesVinculadas.length > habitacionesPorPagina && (
                <div className={styles.paginacion}>
                  <button
                    className={styles.btnPagina}
                    onClick={() => setPaginaHabitaciones(prev => Math.max(1, prev - 1))}
                    disabled={paginaHabitaciones === 1}
                  >
                    Anterior
                  </button>
                  <span className={styles.paginaInfo}>
                    Página {paginaHabitaciones} de {totalPaginasHab}
                  </span>
                  <button
                    className={styles.btnPagina}
                    onClick={() => setPaginaHabitaciones(prev => Math.min(totalPaginasHab, prev + 1))}
                    disabled={paginaHabitaciones === totalPaginasHab}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </section>
          )}
        </div>
        
        {/* Footer con botones de acción */}
        <div className={styles.footer}>
          <button 
            className={styles.btnCancelar} 
            onClick={handleCancelar}
            disabled={guardando}
          >
            <FaTimes /> Cancelar
          </button>
          <button 
            className={styles.btnGuardar} 
            onClick={handleGuardar}
            disabled={guardando}
          >
            <FaSave /> {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </main>

      {/* Modal de Habitaciones */}
      <ModalHabitacion
        isOpen={modalHabitacionOpen}
        onClose={() => {
          setModalHabitacionOpen(false);
          setHabitacionEditando(null);
        }}
        onSubmit={handleSubmitHabitacion}
        habitacion={habitacionEditando}
        tipoHabitacionId={id}
      />
    </div>
  );
}
