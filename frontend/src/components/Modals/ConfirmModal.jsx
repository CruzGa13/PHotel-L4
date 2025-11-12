import { X } from 'lucide-react';

/**
 * Modal de confirmación reutilizable
 * @param {boolean} open - Si el modal está abierto
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje de confirmación
 * @param {string} confirmText - Texto del botón de confirmación
 * @param {string} cancelText - Texto del botón de cancelación
 * @param {function} onConfirm - Callback al confirmar
 * @param {function} onClose - Callback al cerrar/cancelar
 * @param {boolean} loading - Estado de carga
 * @param {string} variant - Variante de estilo ('danger', 'success', 'warning')
 */
export default function ConfirmModal({
  open = false,
  title = 'Confirmar acción',
  message = '¿Estás seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
  variant = 'success',
  children,
}) {
  if (!open) return null;

  const variantStyles = {
    danger: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500',
    success: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500',
    warning: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500',
  };

  const confirmButtonClass = variantStyles[variant] || variantStyles.success;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {message}
          </p>
          
          {/* Contenido adicional (ej: campos de fecha) */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
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
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
