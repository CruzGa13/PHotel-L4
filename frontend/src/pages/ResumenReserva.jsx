import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente ResumenReserva
 * 
 * Página de resumen de reserva que muestra:
 * - Detalles de la habitación y fechas
 * - Resumen de precios con desglose
 * - Botón de confirmación
 * 
 * Recibe datos vía location.state desde WidgetReserva
 */
export default function ResumenReserva() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraer datos de la reserva del state
  const { reservaData } = location.state || {};
  
  // Estado para el proceso de confirmación
  const [isProcessing, setIsProcessing] = useState(false);

  // Validación: Redirigir si no hay datos
  useEffect(() => {
    if (!reservaData) {
      console.warn('⚠️ [ResumenReserva] No hay datos de reserva, redirigiendo a inicio...');
      navigate('/');
    }
  }, [reservaData, navigate]);

  // Si no hay datos, no renderizar nada (el useEffect redirigirá)
  if (!reservaData) {
    return null;
  }

  // Formatear precio en ARS
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(precio));
  };

  // Formatear fechas
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Cálculos de impuestos eliminados - el precioTotal ya es el valor final

  /**
   * Handler para confirmar la reserva
   * Simula un proceso de envío al backend
   */
  const handleConfirmarReserva = () => {
    setIsProcessing(true);
    
    console.log('📤 [ResumenReserva] Enviando reserva FINAL al backend:', {
      ...reservaData,
      timestamp: new Date().toISOString()
    });

    // Simular llamada al backend con timeout de 3 segundos
    setTimeout(() => {
      setIsProcessing(false);
      console.log('✅ [ResumenReserva] Reserva confirmada exitosamente');
      
      // TODO: Navegar a página de confirmación/éxito
      // navigate('/reserva-exitosa');
      
      // Por ahora, volver a inicio
      alert('¡Reserva confirmada exitosamente! (Simulado)');
      navigate('/');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Título Principal */}
        <div className="mb-10 pt-10">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            Resumen de Reserva
          </h1>
          <p className="text-lg text-gray-600">
            Revisa los detalles antes de confirmar
          </p>
        </div>

        {/* Contenedor de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: Detalles de la Reserva */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Información de la Habitación */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                <span className="text-2xl mr-2">🏨</span>
                Detalles de la Habitación
              </h2>
              
              <div className="space-y-4">
                {/* Nombre de la Habitación */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Habitación:</span>
                  <span className="text-gray-900 font-bold text-lg">
                    {reservaData.habitacionNombre}
                  </span>
                </div>

                {/* Huéspedes */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Huéspedes:</span>
                  <span className="text-gray-900 font-semibold flex items-center">
                    <span className="text-xl mr-1">👥</span>
                    {reservaData.huespedes} {reservaData.huespedes === 1 ? 'huésped' : 'huéspedes'}
                  </span>
                </div>

                {/* Check-in */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Check-in:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatearFecha(reservaData.checkIn)}
                  </span>
                </div>

                {/* Check-out */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Check-out:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatearFecha(reservaData.checkOut)}
                  </span>
                </div>

                {/* Noches */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total de noches:</span>
                  <span className="text-green-700 font-bold text-lg">
                    {reservaData.noches} {reservaData.noches === 1 ? 'noche' : 'noches'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Políticas y Condiciones */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                <span className="text-xl mr-2">ℹ️</span>
                Políticas de Reserva
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check-in: a partir de las 15:00 hs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check-out: hasta las 11:00 hs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Cancelación gratuita hasta 48 hs antes del check-in</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Se requiere documento de identidad al momento del check-in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* COLUMNA DERECHA: Resumen de Precios */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-green-700 mb-6">
                Resumen de Precios
              </h2>

              <div className="space-y-4 mb-6">
                {/* Precio por noche */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {formatearPrecio(reservaData.precioNoche)} x {reservaData.noches} {reservaData.noches === 1 ? 'noche' : 'noches'}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {formatearPrecio(reservaData.precioTotal)}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-4">
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">
                        {formatearPrecio(reservaData.precioTotal)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ARS (Pesos Argentinos)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                onClick={handleConfirmarReserva}
                disabled={isProcessing}
                className={`w-full font-bold py-4 px-6 rounded-full
                           shadow-lg hover:shadow-xl
                           transition-all duration-300
                           transform hover:scale-[1.02] active:scale-[0.98]
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                           ${isProcessing
                             ? 'bg-gray-400 cursor-not-allowed text-white'
                             : 'bg-green-700 hover:bg-green-800 text-white'
                           }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Confirmar Reserva'
                )}
              </button>

              {/* Nota de seguridad */}
              <p className="text-center text-xs text-gray-500 mt-4">
                🔒 Transacción segura y protegida
              </p>

              {/* Botón Volver */}
              <button
                onClick={() => navigate(-1)}
                disabled={isProcessing}
                className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-gray-900 
                          transition-colors duration-200 disabled:opacity-50"
              >
                ← Volver a la habitación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
