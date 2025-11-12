import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

/**
 * Modal para cambiar estado de habitación con selector y opciones de bloqueo
 * @param {boolean} open - Si el modal está abierto
 * @param {function} onClose - Callback al cerrar
 * @param {function} onConfirm - Callback al confirmar con { estado, desde?, hasta?, motivo?, tipo? }
 * @param {boolean} loading - Estado de carga
 * @param {string} currentEstado - Estado actual de la habitación
 * @param {string} numeroHabitacion - Número de la habitación
 */
export default function EstadoHabitacionModal({
  open = false,
  onClose,
  onConfirm,
  loading = false,
  currentEstado = 'Disponible',
  numeroHabitacion = '',
}) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Disponible');
  const [usarBloqueo, setUsarBloqueo] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [tipo, setTipo] = useState('Mantenimiento');
  const [error, setError] = useState('');

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (open) {
      setEstadoSeleccionado(currentEstado === 'Disponible' ? 'Mantenimiento' : 'Disponible');
      setUsarBloqueo(false);
      setDesde('');
      setHasta('');
      setMotivo('');
      setTipo('Mantenimiento');
      setError('');
    }
  }, [open, currentEstado]);

  // Validar formulario
  const validarFormulario = () => {
    setError('');

    if (estadoSeleccionado === 'Mantenimiento' && usarBloqueo) {
      if (!desde || !hasta) {
        setError('Las fechas de inicio y fin son requeridas para el bloqueo');
        return false;
      }

      const fechaDesde = new Date(desde);
      const fechaHasta = new Date(hasta);

      if (fechaDesde >= fechaHasta) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio');
        return false;
      }

      // Validar que las fechas no sean en el pasado
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaDesde < hoy) {
        setError('La fecha de inicio no puede ser en el pasado');
        return false;
      }
    }

    return true;
  };

  const handleConfirm = () => {
    if (!validarFormulario()) {
      return;
    }

    const payload = { estado: estadoSeleccionado };

    // Si es Mantenimiento con bloqueo, agregar datos de bloqueo
    if (estadoSeleccionado === 'Mantenimiento' && usarBloqueo) {
      payload.desde = desde;
      payload.hasta = hasta;
      payload.motivo = motivo || 'Bloqueo desde detalle de habitación';
      payload.tipo = tipo;
    }

    onConfirm(payload);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Manejador para cerrar con Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200 rounded-t-2xl">
          <h3 className="text-xl font-semibold text-slate-800">
            Cambiar Estado - Habitación {numeroHabitacion}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Selector de Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Nuevo estado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEstadoSeleccionado('Disponible')}
                disabled={loading}
                className={`p-4 rounded-xl border-2 transition-all ${
                  estadoSeleccionado === 'Disponible'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-medium">Disponible</div>
                <div className="text-xs mt-1">Lista para uso</div>
              </button>
              
              <button
                type="button"
                onClick={() => setEstadoSeleccionado('Mantenimiento')}
                disabled={loading}
                className={`p-4 rounded-xl border-2 transition-all ${
                  estadoSeleccionado === 'Mantenimiento'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-medium">Mantenimiento</div>
                <div className="text-xs mt-1">Fuera de servicio</div>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Estado <span className="font-medium">Ocupada</span> se gestiona automáticamente por las reservas
            </p>
          </div>

          {/* Opciones de Mantenimiento */}
          {estadoSeleccionado === 'Mantenimiento' && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              {/* Checkbox para usar bloqueo */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usarBloqueo}
                  onChange={(e) => setUsarBloqueo(e.target.checked)}
                  disabled={loading}
                  className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">
                    Programar bloqueo con fechas
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Bloquea la habitación en un período específico
                  </div>
                </div>
              </label>

              {/* Campos de bloqueo */}
              {usarBloqueo && (
                <div className="space-y-4 pl-7">
                  {/* Fecha desde */}
                  <div>
                    <label htmlFor="desde" className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha de inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="desde"
                      type="date"
                      value={desde}
                      onChange={(e) => setDesde(e.target.value)}
                      disabled={loading}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Fecha hasta */}
                  <div>
                    <label htmlFor="hasta" className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="hasta"
                      type="date"
                      value={hasta}
                      onChange={(e) => setHasta(e.target.value)}
                      disabled={loading}
                      min={desde || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      La fecha de fin es exclusiva (no incluye ese día)
                    </p>
                  </div>

                  {/* Tipo de bloqueo */}
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo de bloqueo
                    </label>
                    <select
                      id="tipo"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="FueraDeServicio">Fuera de Servicio</option>
                      <option value="BloqueoOperativo">Bloqueo Operativo</option>
                    </select>
                  </div>

                  {/* Motivo */}
                  <div>
                    <label htmlFor="motivo" className="block text-sm font-medium text-slate-700 mb-1">
                      Motivo (opcional)
                    </label>
                    <textarea
                      id="motivo"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      disabled={loading}
                      rows={3}
                      placeholder="Ej: Reparación de instalaciones eléctricas"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white flex flex-col-reverse sm:flex-row gap-3 p-6 border-t border-slate-200 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-2xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-2xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : (
              'Confirmar cambio'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
