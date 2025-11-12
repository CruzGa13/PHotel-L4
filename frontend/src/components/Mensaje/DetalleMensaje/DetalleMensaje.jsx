import { useState, useEffect, useRef } from 'react';
import styles from './DetalleMensaje.module.css';
import emailService from '../../../services/emailService';
import { extraerCuerpoReciente } from '../../../utils/emailParser';

export default function DetalleMensaje({ mensaje, onClose, onMarcarRespondido }) {
  const [closing, setClosing] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const modalRef = useRef(null);

  // Focus trap: enfocar el modal al abrir
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Auto-cerrar toast después de 3 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Función para mostrar toast
  const showToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleMarcarRespondido = () => {
    onMarcarRespondido(mensaje);
    handleClose();
  };

  const handleEnviarRespuesta = async () => {
    if (!respuesta.trim()) {
      setError('Debes escribir un mensaje');
      return;
    }

    setEnviando(true);
    setError(null);

    const resultado = await emailService.responderEmail(mensaje.id, {
      asunto: `Re: ${mensaje.asunto}`,
      cuerpoTexto: respuesta
      // operadorId: null se enviará automáticamente
    });

    if (resultado.success) {
      showToast('✅ Respuesta enviada correctamente a ' + mensaje.email, 'success');
      setTimeout(() => {
        onMarcarRespondido(mensaje); // Marcar como respondido
        handleClose();
      }, 1500); // Esperar 1.5s para que vea el toast
    } else {
      const errorMsg = resultado.error || 'Error al enviar respuesta';
      setError(errorMsg);
      showToast('❌ ' + errorMsg, 'error');
      setEnviando(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCanalIcon = (canal) => {
    const iconos = {
      Web: '🌐',
      Email: '📧',
      WhatsApp: '💬'
    };
    return iconos[canal] || '📨';
  };

  // Extraer solo el mensaje reciente (sin citas ni firmas)
  const obtenerMensajeLimpio = () => {
    if (!mensaje?.contenido) return '';
    
    const contenidoLimpio = extraerCuerpoReciente({ 
      text: mensaje.contenido 
    });

    // Si después de limpiar no queda nada, mostrar el original
    return contenidoLimpio || mensaje.contenido;
  };

  // Función para descargar adjuntos
  const descargarAdjunto = (adjunto) => {
    try {
      // Convertir base64 a blob
      const byteCharacters = atob(adjunto.dataBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: adjunto.mimeType });

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = adjunto.nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`⬇️ Descargando ${adjunto.nombreArchivo}`, 'success');
    } catch (error) {
      console.error('Error al descargar adjunto:', error);
      showToast('❌ Error al descargar el archivo', 'error');
    }
  };

  // Helper para iconos según tipo de archivo
  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📎';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return '🗜️';
    if (mimeType.includes('text')) return '📃';
    return '📎';
  };

  // Helper para formatear tamaño
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!mensaje) return null;

  return (
    <div 
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ''}`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${closing ? styles.modalClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header del modal */}
        <div className={styles.header}>
          <div>
            <h2 id="modal-title" className={styles.modalTitle}>
              📧 Detalle del Mensaje
            </h2>
            <div className={styles.headerMeta}>
              <span className={styles.idBadge}>ID #{mensaje.id}</span>
              <span
                className={`${styles.estadoBadge} ${
                  mensaje.estado === 'Pendiente'
                    ? styles.estadoPendiente
                    : styles.estadoRespondido
                }`}
              >
                {mensaje.estado === 'Pendiente' ? '⏳' : '✅'} {mensaje.estado}
              </span>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Body - Siempre muestra el detalle */}
        <div className={styles.body}>
          {/* Asunto */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Asunto</h3>
            <p className={styles.asunto}>{mensaje.asunto}</p>
          </div>

          {/* Información del remitente */}
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Remitente</label>
              <p>{mensaje.remitente}</p>
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <p className={styles.email}>{mensaje.email}</p>
            </div>
          </div>

          {/* Metadatos */}
          <div className={styles.grid3}>
            <div className={styles.field}>
              <label>Canal</label>
              <p>
                <span className={styles.canalBadge}>
                  {getCanalIcon(mensaje.canal)} {mensaje.canal}
                </span>
              </p>
            </div>
            <div className={styles.field}>
              <label>Prioridad</label>
              <p>
                <span
                  className={`${styles.prioridadBadge} ${
                    mensaje.prioridad === 'Alta'
                      ? styles.prioridadAlta
                      : mensaje.prioridad === 'Media'
                      ? styles.prioridadMedia
                      : styles.prioridadBaja
                  }`}
                >
                  {mensaje.prioridad}
                </span>
              </p>
            </div>
            <div className={styles.field}>
              <label>Fecha</label>
              <p className={styles.fecha}>{formatearFecha(mensaje.fecha)}</p>
            </div>
          </div>

          {/* Contenido del mensaje */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.iconMessage}>💬</span> Mensaje
            </h3>
            <div className={styles.contenidoBox}>
              <div className={styles.messageContent}>
                <div className={styles.messageBubble}>
                  {obtenerMensajeLimpio()}
                </div>
              </div>

              {/* Adjuntos (si existen) */}
              {mensaje.tieneAdjuntos && mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                <div className={styles.adjuntosSection}>
                  <h4 className={styles.adjuntosTitle}>
                    📎 Adjuntos ({mensaje.adjuntos.length})
                  </h4>
                  <div className={styles.adjuntosList}>
                    {mensaje.adjuntos.map((adjunto) => (
                      <div key={adjunto.id} className={styles.adjuntoItem}>
                        <div className={styles.adjuntoInfo}>
                          <span className={styles.adjuntoIcon}>
                            {getFileIcon(adjunto.mimeType)}
                          </span>
                          <div className={styles.adjuntoDetails}>
                            <p className={styles.adjuntoNombre}>
                              {adjunto.nombreArchivo}
                            </p>
                            <p className={styles.adjuntoSize}>
                              {formatBytes(adjunto.tamano)}
                            </p>
                          </div>
                        </div>
                        <button
                          className={styles.btnDescargar}
                          onClick={() => descargarAdjunto(adjunto)}
                          title="Descargar archivo"
                        >
                          ⬇️ Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Respuesta (si existe) - Ahora debajo del mensaje */}
              {mensaje.respuesta && (
                <div className={styles.respuestaContainer}>
                  <div className={styles.respuestaDivider}>
                    <span className={styles.respuestaLabel}>↳ Tu respuesta</span>
                  </div>
                  <div className={styles.respuestaBox}>
                    {mensaje.respuesta}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de respuesta - Aparece debajo cuando se activa */}
          {mostrarFormulario && mensaje.estado === 'Pendiente' && (
            <div className={styles.respuestaFormSection}>
              <div className={styles.respuestaFormHeader}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.iconReply}>✍️</span> Escribir Respuesta
                </h3>
              </div>
              <div className={styles.respuestaForm}>
                <div className={styles.formField}>
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={10}
                    className={styles.textarea}
                    disabled={enviando}
                    autoFocus
                  />
                </div>
                {error && (
                  <div className={styles.errorBox}>
                    ⚠️ {error}
                  </div>
                )}
                <div className={styles.formActions}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => {
                      setMostrarFormulario(false);
                      setRespuesta('');
                      setError(null);
                    }}
                    disabled={enviando}
                  >
                    ✕ Cancelar
                  </button>
                  <button
                    className={styles.btnSuccess}
                    onClick={handleEnviarRespuesta}
                    disabled={enviando || !respuesta.trim()}
                  >
                    {enviando ? '📤 Enviando...' : '📤 Enviar Respuesta'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className={styles.footer}>
          <button
            className={styles.btnSecondary}
            onClick={handleClose}
          >
            Cerrar
          </button>
          {mensaje.estado === 'Pendiente' && !mostrarFormulario && (
            <button
              className={styles.btnResponder}
              onClick={() => setMostrarFormulario(true)}
            >
              📧 Responder Email
            </button>
          )}
        </div>
      </div>

      {/* Toast de notificaciones */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.tipo.charAt(0).toUpperCase() + toast.tipo.slice(1)}`]}`}>
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}
