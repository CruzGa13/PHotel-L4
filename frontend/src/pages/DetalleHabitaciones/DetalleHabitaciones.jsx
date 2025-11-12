import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getHabitacionById, updateHabitacionEstado, bloquearHabitacion } from "../../services/habitaciones.api";
import GalleryCarousel from "../../components/Habitaciones/GalleryCarousel/GalleryCarousel";
import EstadoHabitacionModal from "../../components/Habitaciones/EstadoHabitacionModal/EstadoHabitacionModal";
import "./DetalleHabitaciones.css";

export default function DetalleHabitacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habitacion, setHabitacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadoOriginal, setEstadoOriginal] = useState(null);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState(false);

  // Cargar habitación desde API
  useEffect(() => {
    const fetchHabitacion = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getHabitacionById(id);
        setHabitacion(data);
        setEstadoOriginal(data.estado);
      } catch (err) {
        console.error('Error al cargar habitación:', err);
        setError(err.message);
        toast.error(err.message, { position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };
    fetchHabitacion();
  }, [id]);

  // Abrir modal de cambio de estado
  const handleEstadoToggle = () => {
    setShowEstadoModal(true);
  };

  // Confirmar cambio de estado (con o sin bloqueo)
  const handleConfirmEstadoChange = async (payload) => {
    try {
      setUpdatingEstado(true);
      
      // Flujo según el payload
      if (payload.estado === 'Disponible') {
        // Cambiar a Disponible (sin bloqueo)
        const updated = await updateHabitacionEstado(habitacion.id, 'Disponible');
        
        // Refetch para obtener datos actualizados
        const refreshed = await getHabitacionById(habitacion.id);
        setHabitacion(refreshed);
        setEstadoOriginal(refreshed.estado);
        
        toast.success(
          `Habitación ${habitacion.numero} cambiada a Disponible correctamente`,
          { position: 'top-center' }
        );
      } else if (payload.estado === 'Mantenimiento') {
        // Mantenimiento con o sin bloqueo
        if (payload.desde && payload.hasta) {
          // Con bloqueo programado
          await bloquearHabitacion(habitacion.id, {
            desde: payload.desde,
            hasta: payload.hasta,
            motivo: payload.motivo,
            tipo: payload.tipo,
          });
          
          // Cambiar estado a Mantenimiento
          await updateHabitacionEstado(habitacion.id, 'Mantenimiento');
          
          // Refetch
          const refreshed = await getHabitacionById(habitacion.id);
          setHabitacion(refreshed);
          setEstadoOriginal(refreshed.estado);
          
          toast.success(
            `Habitación ${habitacion.numero} bloqueada y cambiada a Mantenimiento`,
            { position: 'top-center' }
          );
        } else {
          // Sin bloqueo, solo cambio de estado
          const updated = await updateHabitacionEstado(habitacion.id, 'Mantenimiento');
          
          // Refetch
          const refreshed = await getHabitacionById(habitacion.id);
          setHabitacion(refreshed);
          setEstadoOriginal(refreshed.estado);
          
          toast.success(
            `Habitación ${habitacion.numero} cambiada a Mantenimiento correctamente`,
            { position: 'top-center' }
          );
        }
      }
      
      setShowEstadoModal(false);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error(err.message || 'Error al cambiar estado', { position: 'top-center' });
    } finally {
      setUpdatingEstado(false);
    }
  };

  const handleGuardarCambios = () => {
    console.log("Guardando otros cambios:", habitacion);
    toast.success('Cambios guardados correctamente', { position: 'top-center' });
    // TODO: Implementar actualización de otros campos en backend
    navigate("/habitaciones-op");
  };

  if (loading) {
    return (
      <div className="page">
        <main className="container-main fade-in">
          <div className="breadcrumb">
            <span>Inicio</span>
            <span className="sep">›</span>
            <Link to="/habitaciones-op">Gestión De Habitaciones</Link>
            <span className="sep">›</span>
            <span className="pink">Cargando...</span>
          </div>
          <div className="head-top pt-10">
            <div>
              <h2 className="gradient-text">Cargando detalle...</h2>
              <p className="muted">Por favor espere</p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-6 mt-6">
            <div className="col-span-12">
              <GalleryCarousel images={[]} loading={true} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !habitacion) {
    return (
      <div className="page">
        <main className="container-main fade-in">
          <div className="breadcrumb">
            <span>Inicio</span>
            <span className="sep">›</span>
            <Link to="/habitaciones-op">Gestión De Habitaciones</Link>
            <span className="sep">›</span>
            <span className="pink">Error</span>
          </div>
          <div className="glass p-6 rounded-2xl text-center">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error al cargar habitación</h3>
            <p className="text-slate-600 mb-4">{error || 'Habitación no encontrada'}</p>
            <Link to="/habitaciones-op" className="btn btn-blue">
              Volver al listado
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="container-main fade-in">
        
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="sep">›</span>
          <Link to="/habitaciones-op">Gestión De Habitaciones</Link>
          <span className="sep">›</span>
          <span className="pink">#{habitacion.numero}</span>
        </div>

        {/* Cabecera */}
        <div className="head-top pt-10">
          <div>
            <h2 className="gradient-text">
              Habitación {habitacion.numero} - {habitacion.tipoHabitacion?.nombre}
            </h2>
            <p className="muted">Detalle y gestión de la habitación</p>
          </div>
          <Link 
            to="/habitaciones-op" 
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
          >
            Volver a la lista
          </Link>
        </div>

        {/* Layout Responsive Grid */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          
          {/* GALERÍA - Col 6 en desktop, 12 en mobile */}
          <div className="col-span-12 lg:col-span-6">
            <GalleryCarousel 
              images={habitacion.tipoHabitacion?.imagenes || []} 
              loading={false}
            />
          </div>

          {/* INFORMACIÓN - Col 6 en desktop, 12 en mobile */}
          <div className="col-span-12 lg:col-span-6">
            {/* Card de Información General */}
            <div className="rounded-2xl p-6 shadow-sm bg-white mb-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-3">Información General</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Número</label>
                  <p className="text-sm text-slate-800 font-medium">{habitacion.numero}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Piso</label>
                  <p className="text-sm text-slate-800 font-medium">{habitacion.piso}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Categoría</label>
                  <p className="text-sm text-slate-800">{habitacion.tipoHabitacion?.categoria?.nombre}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Tipo</label>
                  <p className="text-sm text-slate-800">{habitacion.tipoHabitacion?.nombre}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Capacidad</label>
                  <p className="text-sm text-slate-800">{habitacion.tipoHabitacion?.ocupacion?.capacidad} personas</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Superficie</label>
                  <p className="text-sm text-slate-800">{habitacion.tipoHabitacion?.superficie || 'N/A'} m²</p>
                </div>
              </div>
              {habitacion.tipoHabitacion?.descripcion && (
                <div className="mt-4">
                  <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Descripción</label>
                  <p className="text-sm text-slate-800">{habitacion.tipoHabitacion.descripcion}</p>
                </div>
              )}
            </div>

            {/* Card de Gestión de Estado */}
            <div className="rounded-2xl p-6 shadow-sm bg-white">
              <h4 className="text-lg font-semibold text-slate-800 mb-3">Gestión de Estado</h4>
              <p className="text-sm text-slate-600 mb-4">
                Estado actual:
                <span className={
                  `ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    habitacion.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-800' :
                    habitacion.estado === 'Ocupada' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`
                }>
                  {habitacion.estado}
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Botón Cambiar Estado - Siempre verde corporativo */}
                <button 
                  className="w-full sm:flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-2xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleEstadoToggle}
                  disabled={updatingEstado}
                  type="button"
                >
                  Cambiar estado
                </button>
                
                {/* Botón Guardar Cambios - Outline Verde */}
                <button
                  className="w-full sm:flex-1 px-4 py-2.5 text-sm font-medium text-emerald-600 bg-white border-2 border-emerald-500 rounded-2xl hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGuardarCambios}
                  disabled={habitacion.estado === estadoOriginal}
                  type="button"
                >
                  Guardar otros cambios
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal de Cambio de Estado */}
        <EstadoHabitacionModal
          open={showEstadoModal}
          onClose={() => setShowEstadoModal(false)}
          onConfirm={handleConfirmEstadoChange}
          loading={updatingEstado}
          currentEstado={habitacion?.estado}
          numeroHabitacion={habitacion?.numero}
        />
      </main>
    </div>
  );
}