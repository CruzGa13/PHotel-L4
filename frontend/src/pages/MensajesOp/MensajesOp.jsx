import { useMemo, useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import CardMensajes from "../../components/Mensaje/CardMensajes/CardMensajes.jsx";
import FiltroMensajes from "../../components/Mensaje/FiltroMensajes/FiltroMensajes.jsx";
import TablaMensajes from "../../components/Mensaje/TablaMensajes/TablaMensajes.jsx";
import DetalleMensaje from "../../components/Mensaje/DetalleMensaje/DetalleMensaje.jsx";
import GraficosEstadisticas from "../../components/Mensaje/GraficosEstadisticas/GraficosEstadisticas.jsx";
import emailService from "../../services/emailService.js";
// import { mockMensajes, calcularEstadisticas, filtrarMensajes } from "./mocks.js"; // Backup
import styles from "./MensajesOp.module.css";

export default function MensajesOp() {
  // Estado de mensajes
  const [mensajes, setMensajes] = useState([]);
  const [mensajeDetalle, setMensajeDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [autoSyncEnProgreso, setAutoSyncEnProgreso] = useState(false);

  // Estado de tabs
  const [tabActiva, setTabActiva] = useState('bandeja');

  // Estado de filtros
  const [filtros, setFiltros] = useState({
    texto: '',
    estado: 'Todos',
    canal: 'Todos',
    prioridad: 'Todos',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Cargar mensajes al montar
  useEffect(() => {
    cargarMensajes();
    
    // Auto-refresh cada 2 minutos
    const interval = setInterval(() => {
      cargarMensajes(true); // Silencioso
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  // Cargar mensajes desde la API
  const cargarMensajes = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    if (silencioso) setAutoSyncEnProgreso(true);
    setError(null);

    const cantidadAnterior = mensajes.length;
    const resultado = await emailService.listarEmails(filtros);

    if (resultado.success) {
      setMensajes(resultado.emails);
      setUltimaActualizacion(new Date());
      
      // Toast discreto solo si hay cambios en auto-sync
      if (silencioso && resultado.emails.length > cantidadAnterior) {
        const emailsNuevos = resultado.emails.length - cantidadAnterior;
        toast.success(`${emailsNuevos} email(s) nuevo(s) recibido(s)`, {
          duration: 4000,
          icon: '📬',
          position: 'bottom-right'
        });
      }
    } else {
      setError(resultado.error);
      if (silencioso) {
        toast.error('Error al sincronizar automáticamente', {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    }

    setLoading(false);
    setAutoSyncEnProgreso(false);
  };

  // Estadísticas calculadas desde todos los mensajes
  const estadisticas = useMemo(() => {
    return emailService.calcularEstadisticas(mensajes);
  }, [mensajes]);

  // Mensajes filtrados (cliente-side para performance)
  const mensajesFiltrados = useMemo(() => {
    return mensajes.filter((mensaje) => {
      // Filtro por texto
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
        fechaHasta.setHours(23, 59, 59, 999);
        if (fechaMensaje > fechaHasta) return false;
      }
      
      return true;
    });
  }, [mensajes, filtros]);

  // Handler para limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      texto: '',
      estado: 'Todos',
      canal: 'Todos',
      prioridad: 'Todos',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  // Handler para marcar como respondido
  const handleMarcarRespondido = async (mensaje) => {
    const resultado = await emailService.actualizarEmail(mensaje.id, {
      estado: 'Respondido'
    });

    if (resultado.success) {
      // Actualizar lista local
      setMensajes(prev => 
        prev.map(m => m.id === mensaje.id ? resultado.email : m)
      );
      toast.success(`Mensaje #${mensaje.id} marcado como respondido`, {
        duration: 3000,
        icon: '✅'
      });
      console.log('[MensajesOp] Mensaje marcado como respondido:', mensaje.id);
    } else {
      toast.error(`Error al actualizar: ${resultado.error}`, {
        duration: 5000,
        icon: '❌'
      });
    }
  };

  // Handler para sincronizar manualmente
  const handleSincronizar = async () => {
    setSincronizando(true);
    
    try {
      const resultado = await emailService.sincronizarEmails();
      
      if (resultado.success) {
        await cargarMensajes();
        const newCount = resultado.data?.newEmails || 0;
        
        if (newCount > 0) {
          toast.success(`🎉 ${newCount} email(s) nuevo(s) sincronizado(s)`, {
            duration: 4000,
            icon: '✅'
          });
        } else {
          toast.success('✅ No hay emails nuevos', {
            duration: 3000,
            icon: 'ℹ️'
          });
        }
      } else {
        // Mensaje de error más amigable
        toast.error('⚠️ No se pudo completar la sincronización. Algunos emails pueden tener formato incompatible.', {
          duration: 5000,
          icon: '⚠️'
        });
      }
    } catch (error) {
      console.error('[MensajesOp] Error en sincronización:', error);
      toast.error('❌ Error de conexión al sincronizar. Por favor, intenta nuevamente.', {
        duration: 5000,
        icon: '❌'
      });
    } finally {
      setSincronizando(false);
    }
  };

  // Helper para formato de tiempo relativo
  const formatTiempoRelativo = (fecha) => {
    const segundos = Math.floor((new Date() - fecha) / 1000);
    if (segundos < 60) return 'hace unos segundos';
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas}h`;
    return 'hace más de 1 día';
  };

  // Mostrar loading inicial
  if (loading && mensajes.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Toaster position="top-right" />
      <main className={styles.containerMain}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Inicio</span>
          <span className={styles.sep}>›</span>
          <span>Operador</span>
          <span className={styles.sep}>›</span>
          <span className={styles.pink}>Mensajes</span>
        </div>

        {/* Cabecera */}
        <div className={styles.headTop}>
          <div>
            <h2 className={styles.gradientText}>💬 Mensajes</h2>
            <p className={styles.muted}>
              Gestión y seguimiento de mensajes de clientes
              {/* Indicador de última actualización */}
              <span className={styles.lastUpdate}>
                {autoSyncEnProgreso ? (
                  <><span className={styles.spinner}>⟳</span> Actualizando...</>
                ) : (
                  <>· Última actualización: {formatTiempoRelativo(ultimaActualizacion)}</>
                )}
              </span>
            </p>
          </div>
          
          {/* Botón de sincronización */}
          <button
            className={styles.btnSync}
            onClick={handleSincronizar}
            disabled={sincronizando}
          >
            {sincronizando ? (
              <><span className={styles.spinnerIcon}>⟳</span> Sincronizando...</>
            ) : (
              '🔄 Sincronizar Gmail'
            )}
          </button>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className={styles.errorBanner}>
            ⚠️ {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Cards de estadísticas */}
        <CardMensajes estadisticas={estadisticas} />

        {/* Filtros */}
        <FiltroMensajes
          filtros={filtros}
          onFiltroChange={setFiltros}
          onLimpiar={handleLimpiarFiltros}
        />

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tabActiva === 'bandeja' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('bandeja')}
          >
            📬 Bandeja ({mensajesFiltrados.length})
          </button>
          <button
            className={`${styles.tab} ${tabActiva === 'estadisticas' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('estadisticas')}
          >
            📊 Estadísticas
          </button>
        </div>

        {/* Contenido de tabs */}
        {tabActiva === 'bandeja' && (
          <div className={styles.fadeIn}>
            <TablaMensajes
              mensajes={mensajesFiltrados}
              onVerDetalle={setMensajeDetalle}
              onMarcarRespondido={handleMarcarRespondido}
            />
          </div>
        )}

        {tabActiva === 'estadisticas' && (
          <div className={`${styles.estadisticasPanel} ${styles.fadeIn}`}>
            <div className={styles.statsGrid}>
              {/* Por Canal */}
              <div className={styles.statsCard}>
                <h3>📡 Por Canal</h3>
                <div className={styles.statsList}>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>🌐 Web</span>
                    <span className={styles.statsValue}>{estadisticas.porCanal.Web}</span>
                  </div>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>📧 Email</span>
                    <span className={styles.statsValue}>{estadisticas.porCanal.Email}</span>
                  </div>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>💬 WhatsApp</span>
                    <span className={styles.statsValue}>{estadisticas.porCanal.WhatsApp}</span>
                  </div>
                </div>
              </div>

              {/* Por Prioridad */}
              <div className={styles.statsCard}>
                <h3>⚡ Por Prioridad</h3>
                <div className={styles.statsList}>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>🔴 Alta</span>
                    <span className={`${styles.statsValue} ${styles.alta}`}>
                      {estadisticas.porPrioridad.Alta}
                    </span>
                  </div>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>🟡 Media</span>
                    <span className={`${styles.statsValue} ${styles.media}`}>
                      {estadisticas.porPrioridad.Media}
                    </span>
                  </div>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>🔵 Baja</span>
                    <span className={`${styles.statsValue} ${styles.baja}`}>
                      {estadisticas.porPrioridad.Baja}
                    </span>
                  </div>
                </div>
              </div>

              {/* Por Estado */}
              <div className={styles.statsCard}>
                <h3>📈 Por Estado</h3>
                <div className={styles.statsList}>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>⏳ Pendientes</span>
                    <span className={`${styles.statsValue} ${styles.pendiente}`}>
                      {estadisticas.pendientes}
                    </span>
                  </div>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>✅ Respondidos</span>
                    <span className={`${styles.statsValue} ${styles.respondido}`}>
                      {estadisticas.respondidos}
                    </span>
                  </div>
                  <div className={styles.statsItem}>
                    <span className={styles.statsLabel}>📊 Total</span>
                    <span className={styles.statsValue}>{estadisticas.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos estadísticos */}
            <GraficosEstadisticas mensajes={mensajes} />
          </div>
        )}
      </main>

      {/* Modal de detalle */}
      {mensajeDetalle && (
        <DetalleMensaje
          mensaje={mensajeDetalle}
          onClose={() => setMensajeDetalle(null)}
          onMarcarRespondido={handleMarcarRespondido}
        />
      )}
    </div>
  );
}