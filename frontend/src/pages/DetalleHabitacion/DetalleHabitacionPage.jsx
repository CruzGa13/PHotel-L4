import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

// Importar subcomponentes
import GaleriaImagenes from '../../components/detalleHabitacion/GaleriaImagenes';
import IconosClaveHabitacion from '../../components/detalleHabitacion/IconosClaveHabitacion';
import ListaAmenidades from '../../components/detalleHabitacion/ListaAmenidades';
import WidgetReserva from '../../components/detalleHabitacion/WidgetReserva';
import BreadCrumb from '../../components/BreadCrumb/BreadCrumb';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Componente de Página de Detalle de Habitación
 * 
 * Muestra información completa de un tipo de habitación específico:
 * - Galería de imágenes
 * - Descripción detallada
 * - Amenidades
 * - Widget de reserva con selector de fechas
 */
export default function DetalleHabitacionPage() {
  // 🔍 DEBUG: Componente montado
  console.log('🏨 [DetalleHabitacionPage] Componente montado');

  // Obtener ID de la URL
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔍 DEBUG: Ver ID obtenido de useParams
  console.log('🔍 [DetalleHabitacionPage] ID de la URL:', id);

  // Estado para datos de la habitación
  const [tipoHabitacion, setTipoHabitacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Los estados de galería y reserva ahora se manejan en los subcomponentes

  // Fetch de datos al montar el componente
  useEffect(() => {
    console.log('🔄 [useEffect] Iniciando fetch para ID:', id);

    const fetchDetallesHabitacion = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/tipos-habitacion/${id}`;
        console.log('📡 [Fetch] URL:', url);

        const response = await fetch(url);
        console.log('📡 [Fetch] Response status:', response.status);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Habitación no encontrada');
          }
          throw new Error('Error al cargar los detalles de la habitación');
        }

        const data = await response.json();
        console.log('✅ [Fetch] Detalles de habitación cargados:', data);
        
        setTipoHabitacion(data);

      } catch (err) {
        console.error('❌ [Error] Al cargar habitación:', err);
        console.error('❌ [Error] Mensaje:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('🏁 [Fetch] Finalizado');
      }
    };

    fetchDetallesHabitacion();
  }, [id]);

  // Los handlers ahora están en los subcomponentes

  // 🔍 DEBUG: Ver estados antes de renderizar
  console.log('🎨 [Render] Estados actuales:', {
    loading,
    error,
    tipoHabitacion: tipoHabitacion ? 'TIENE DATOS' : 'NULL',
    id
  });

  // Renderizado condicional para Loading
  if (loading) {
    console.log('⏳ [Render] Mostrando estado de Loading');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando detalles de la habitación...</p>
        </div>
      </div>
    );
  }

  // Renderizado condicional para Error
  if (error) {
    console.log('❌ [Render] Mostrando estado de Error:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar la habitación</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/habitaciones')}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
          >
            Volver a Habitaciones
          </button>
        </div>
      </div>
    );
  }

  // Renderizado condicional si no hay datos
  if (!tipoHabitacion) {
    console.log('⚠️ [Render] No hay datos de habitación (tipoHabitacion es null)');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Habitación no encontrada</h2>
          <p className="text-gray-600 mb-6">No se pudo encontrar la habitación solicitada</p>
          <button 
            onClick={() => navigate('/habitaciones')}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
          >
            Volver a Habitaciones
          </button>
        </div>
      </div>
    );
  }

  // Renderizado principal
  console.log('✅ [Render] Renderizando página de detalle completa');
  console.log('📊 [Render] Datos de habitación:', {
    id: tipoHabitacion.id,
    nombre: tipoHabitacion.nombre,
    imagenes: tipoHabitacion.imagenes?.length || 0,
    amenidades: tipoHabitacion.amenidades?.length || 0
  });

  return (
    <div className="min-h-screen bg-white">

      {/* Contenedor Principal Centrado */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Breadcrumb controlado */}
        <BreadCrumb 
          mode="controlled"
          items={[
            { label: "Inicio", to: "/" },
            { label: "Nuestras habitaciones", to: "/habitaciones" },
            { label: tipoHabitacion.nombre, current: true }
          ]} 
        />
        
        {/* Título Principal */}
        <header className="mb-6 pt-4">
          <h1 className="text-3xl md:text-4xl leading-tight font-bold bg-gradient-to-b from-green-800 to-green-600 bg-clip-text text-transparent">
            {tipoHabitacion.nombre}
          </h1>
        </header>

        {/* Iconos Clave - Componente Modular */}
        <IconosClaveHabitacion 
          ocupacion={tipoHabitacion.ocupacion}
          superficie={tipoHabitacion.superficie}
        />

        {/* Layout de 2 Columnas con Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* COLUMNA IZQUIERDA (2/3 del ancho en desktop) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Galería de Imágenes - Componente Modular */}
            <GaleriaImagenes 
              imagenes={tipoHabitacion.imagenes}
              nombreHabitacion={tipoHabitacion.nombre}
            />

            {/* Descripción */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">
                {tipoHabitacion.descripcion || 'No hay descripción disponible.'}
              </p>
            </section>

            {/* Amenidades - Componente Modular */}
            {tipoHabitacion.amenidades && tipoHabitacion.amenidades.length > 0 && (
              <ListaAmenidades amenidades={tipoHabitacion.amenidades} />
            )}

            {/* Políticas (si existen) */}
            {tipoHabitacion.politicas && (
              <section className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Políticas de la Habitación</h2>
                <p className="text-gray-700 leading-relaxed">{tipoHabitacion.politicas}</p>
              </section>
            )}

            {/* Vista (si existe) */}
            {tipoHabitacion.vista && (
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Vista</h2>
                <p className="text-gray-700 font-medium">🌄 {tipoHabitacion.vista}</p>
              </section>
            )}
          </div>

          {/* COLUMNA DERECHA (1/3 del ancho en desktop) - Widget de Reserva Modular */}
          <aside className="lg:col-span-1">
            <WidgetReserva 
              tipoHabitacionId={tipoHabitacion.id}
              tarifaBase={tipoHabitacion.tarifaBase}
              ocupacion={tipoHabitacion.ocupacion}
              habitacionNombre={tipoHabitacion.nombre}
              huespedes={tipoHabitacion.ocupacion.capacidad}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
