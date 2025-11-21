import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSave, FaTimes, FaBed, FaDollarSign, FaCheckCircle, FaImage, FaArrowLeft, FaInfoCircle, FaClipboardList } from 'react-icons/fa';
import { MdKingBed } from 'react-icons/md';
import AmenidadesSelector from '../../components/TiposHabitacion/AmenidadesSelector/AmenidadesSelectorNuevo';
import ImagenesUploader from '../../components/TiposHabitacion/ImagenesUploader/ImagenesUploader';
import { uploadMultipleImages } from '../../services/imageService';
import styles from '../EditarTipoHabitacion/EditarTipoHabitacion.module.css';

export default function NuevoTipoHabitacion() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Estados del formulario (VACÍOS para nuevo)
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
  
  const [amenidadesSeleccionadas, setAmenidadesSeleccionadas] = useState([]); // VACÍO
  const [imagenes, setImagenes] = useState([]); // VACÍO
  const [habitacionesVinculadas, setHabitacionesVinculadas] = useState([]); // VACÍO
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState('informacion');
  
  // Paginación de habitaciones
  const [paginaHabitaciones, setPaginaHabitaciones] = useState(1);
  const habitacionesPorPagina = 5;
  
  // Estados para datos del backend
  const [categorias, setCategorias] = useState([]);
  const [ocupaciones, setOcupaciones] = useState([]);
  const [amenidadesDisponibles, setAmenidadesDisponibles] = useState([]);
  
  // Cargar SOLO las listas (NO cargar tipo porque es nuevo)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        console.log('📋 Cargando datos para nuevo tipo de habitación...');
        
        // Cargar solo categorías, ocupaciones y amenidades
        const [categoriasRes, ocupacionesRes, amenidadesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categorias`),
          axios.get(`${API_BASE_URL}/ocupaciones/completas`),
          axios.get(`${API_BASE_URL}/amenidades/completas`)
        ]);
        
        console.log('✅ Categorías cargadas:', categoriasRes.data.length);
        console.log('✅ Ocupaciones cargadas:', ocupacionesRes.data.length);
        console.log('✅ Amenidades disponibles:', amenidadesRes.data.length);
        
        setCategorias(categoriasRes.data);
        setOcupaciones(ocupacionesRes.data);
        setAmenidadesDisponibles(amenidadesRes.data);
        
        console.log('✅ Listo para crear nuevo tipo de habitación');
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        toast.error('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [API_BASE_URL]);
  
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
  
  const handleVolver = () => {
    navigate('/crud-habitaciones');
  };
  
  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de cancelar? Los datos ingresados se perderán.')) {
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
      const confirmar = window.confirm('¿Estás seguro de crear sin amenidades?');
      if (!confirmar) {
        console.log('❌ Creación cancelada por usuario');
        return;
      }
    }
    
    // Validación de imágenes (opcional pero recomendado)
    if (imagenes.length === 0) {
      console.log('⚠️ Advertencia: No se agregaron imágenes');
      const confirmar = window.confirm('¿Estás seguro de crear sin imágenes?');
      if (!confirmar) {
        console.log('❌ Creación cancelada por usuario');
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
      console.log('🚀 Iniciando creación de nuevo tipo de habitación...');
      
      // ========== PASO 1: PROCESAR IMÁGENES ==========
      console.log('📸 Procesando imágenes...');
      console.log('🔍 Imágenes a subir:', imagenes.length);
      console.log('🔍 Detalle de imágenes:', imagenes.map(img => ({
        id: img.id,
        tipo: typeof img.id,
        descripcion: img.descripcion,
        tieneFile: !!img.file
      })));
      
      let imagenesSubidas = [];
      
      // Subir imágenes nuevas a Supabase
      if (imagenes.length > 0) {
        console.log('⬆️ Subiendo imágenes a Supabase...');
        console.log('📁 Categoría ID para carpeta:', formData.categoriaId);
        
        try {
          const archivos = imagenes.map(img => img.file);
          const categoriaId = parseInt(formData.categoriaId);
          
          console.log('📤 Iniciando subida de', archivos.length, 'archivos...');
          const resultados = await uploadMultipleImages(archivos, categoriaId);
          
          imagenesSubidas = resultados.map((resultado, index) => ({
            url: resultado.url,
            descripcion: imagenes[index].descripcion || null
          }));
          
          console.log('✅ Imágenes subidas exitosamente:', imagenesSubidas.length);
          console.log('🔗 URLs generadas:', imagenesSubidas.map(img => img.url));
          console.log('📋 Datos completos de imágenes:', imagenesSubidas);
        } catch (error) {
          console.error('❌ Error al subir imágenes:', error);
          console.error('❌ Detalles del error:', error.message);
          toast.error('Error al subir las imágenes');
          throw error;
        }
      } else {
        console.log('⚠️ No hay imágenes para subir');
      }
      
      // ========== PASO 2: PREPARAR DATOS ==========
      console.log('📦 Preparando datos para enviar al backend...');
      
      const datosNuevoTipo = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoriaId: parseInt(formData.categoriaId),
        ocupacionId: parseInt(formData.ocupacionId),
        tarifaBase: parseFloat(formData.tarifaBase),
        superficie: formData.superficie ? parseFloat(formData.superficie) : null,
        amenidadesIds: amenidadesSeleccionadas,
        imagenesNuevas: imagenesSubidas
      };
      
      console.log('📤 Datos a enviar:', {
        nombre: datosNuevoTipo.nombre,
        categoriaId: datosNuevoTipo.categoriaId,
        ocupacionId: datosNuevoTipo.ocupacionId,
        amenidadesIds: datosNuevoTipo.amenidadesIds.length,
        imagenesNuevas: datosNuevoTipo.imagenesNuevas.length
      });
      
      // ========== PASO 3: CREAR EN BACKEND ==========
      console.log('🌐 Enviando creación al backend...');
      
      const response = await axios.post(
        `${API_BASE_URL}/tipos-habitacion`,
        datosNuevoTipo
      );
      
      console.log('✅ Respuesta del servidor:', response.data);
      console.log('✅ Tipo creado con ID:', response.data.data?.id);
      console.log('✅ Amenidades guardadas:', response.data.data?.amenidades?.length || 0);
      console.log('✅ Imágenes guardadas:', response.data.data?.imagenes?.length || 0);
      
      toast.success('Tipo de habitación creado exitosamente');
      
      // Redirigir a la lista o a editar el tipo recién creado
      navigate('/crud-habitaciones');
      // O si quieres ir a editar: navigate(`/editar-tipo/${response.data.data.id}`);
      
    } catch (error) {
      console.error('❌ Error al crear:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      const mensaje = error.response?.data?.error || 'Error al crear el tipo de habitación';
      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };
  
  const formatearPrecio = (precio) => {
    if (!precio) return '';
    return `$ ${parseInt(precio).toLocaleString('es-AR')}`;
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
          <span className={styles.pink}>Nuevo Tipo</span>
        </div>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Crear Nuevo Tipo de Habitación</h1>
            <p className={styles.subtitle}>Completa la información para crear un nuevo tipo</p>
          </div>
          <button className={styles.btnVolver} onClick={handleVolver}>
            <FaArrowLeft /> Volver a tipos de habitación
          </button>
        </div>

        {/* Tabs */}
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
            <FaCheckCircle /> Amenidades
          </button>
          <button
            className={`${styles.tab} ${tabActiva === 'imagenes' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('imagenes')}
          >
            <FaImage /> Imágenes
          </button>
          <button
            className={`${styles.tab} ${tabActiva === 'habitaciones' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('habitaciones')}
          >
            <FaClipboardList /> Habitaciones ({habitacionesVinculadas.length})
          </button>
        </div>
        
        {/* Contenido de tabs */}
        {tabActiva === 'informacion' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Información General</h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">
                  Nombre del Tipo <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Estancia Armonía, Suite Ejecutiva..."
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="categoriaId">
                  Categoría <span className={styles.required}>*</span>
                </label>
                <select
                  id="categoriaId"
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ocupacionId">
                  Ocupación <span className={styles.required}>*</span>
                </label>
                <select
                  id="ocupacionId"
                  name="ocupacionId"
                  value={formData.ocupacionId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Seleccionar ocupación...</option>
                  {ocupaciones.map(oc => (
                    <option key={oc.id} value={oc.id}>
                      {oc.nombre} ({oc.capacidad} {oc.capacidad === 1 ? 'persona' : 'personas'})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tarifaBase">
                  Tarifa Base <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  id="tarifaBase"
                  name="tarifaBase"
                  value={formData.tarifaBase}
                  onChange={handleInputChange}
                  placeholder="Ej: 45000"
                  min="0"
                  step="1000"
                  className={styles.input}
                />
                {formData.tarifaBase && (
                  <span className={styles.helpText}>
                    {formatearPrecio(formData.tarifaBase)} por noche
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="superficie">
                  Superficie (m²)
                </label>
                <input
                  type="number"
                  id="superficie"
                  name="superficie"
                  value={formData.superficie}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className={styles.input}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="descripcion">
                  Descripción <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe las características principales de este tipo de habitación..."
                  rows="4"
                  className={styles.textarea}
                />
              </div>
            </div>
          </section>
        )}

        {tabActiva === 'amenidades' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Amenidades</h2>
            <p className={styles.sectionDescription}>
              Selecciona las amenidades que incluye este tipo de habitación
            </p>
            
            <AmenidadesSelector
              amenidadesDisponibles={amenidadesDisponibles}
              amenidadesSeleccionadas={amenidadesSeleccionadas}
              onChange={setAmenidadesSeleccionadas}
            />
          </section>
        )}

        {tabActiva === 'imagenes' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Imágenes</h2>
            <p className={styles.sectionDescription}>
              Agrega imágenes para mostrar este tipo de habitación
            </p>
            
            <ImagenesUploader
              imagenes={imagenes}
              onChange={setImagenes}
            />
          </section>
        )}

        {tabActiva === 'habitaciones' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Habitaciones</h2>
            <div className={styles.infoBox} style={{ marginTop: '20px' }}>
              <FaInfoCircle className={styles.infoIcon} />
              <div>
                <p className={styles.infoTitle}>Información</p>
                <p className={styles.infoText}>
                  Las habitaciones se pueden agregar después de crear el tipo de habitación.
                  Una vez creado, podrás editar este tipo y agregar las habitaciones físicas correspondientes.
                </p>
              </div>
            </div>
          </section>
        )}

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
            <FaSave /> {guardando ? 'Creando...' : 'Crear Tipo de Habitación'}
          </button>
        </div>
      </main>
    </div>
  );
}
