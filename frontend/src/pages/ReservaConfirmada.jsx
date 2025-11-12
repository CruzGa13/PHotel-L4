import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaUsers, FaBed, FaEnvelope, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Página de confirmación de reserva exitosa
 * Verifica el pago con Stripe y muestra los detalles de la reserva confirmada
 */
export default function ReservaConfirmada() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);

  // Scroll al inicio al montar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Verificar pago al montar
  useEffect(() => {
    const verificarPago = async () => {
      try {
        // Obtener parámetros de la URL
        const sessionId = searchParams.get('session_id');
        const reservaId = searchParams.get('reservaId');

        console.log('🔍 [ReservaConfirmada] Iniciando verificación de pago');
        console.log('📊 [ReservaConfirmada] API URL:', API);
        console.log('📋 [ReservaConfirmada] Parámetros:', { sessionId, reservaId });

        if (!sessionId) {
          console.log('❌ [ReservaConfirmada] sessionId faltante');
          setError('No se proporcionó un ID de sesión de pago');
          setLoading(false);
          return;
        }

        if (!reservaId) {
          console.log('❌ [ReservaConfirmada] reservaId faltante');
          setError('No se proporcionó un ID de reserva');
          setLoading(false);
          return;
        }

        // Llamar al endpoint de confirmación
        const confirmUrl = `${API}/pagos/confirmacion?session_id=${sessionId}&reservaId=${reservaId}`;
        console.log('📡 [ReservaConfirmada] Llamando a:', confirmUrl);
        
        const response = await fetch(confirmUrl, { method: 'GET' });
        console.log('📡 [ReservaConfirmada] Response status:', response.status);
        console.log('📡 [ReservaConfirmada] Response headers:', response.headers.get('content-type'));

        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('❌ [ReservaConfirmada] Respuesta no es JSON:', text.substring(0, 200));
          throw new Error('El servidor no devolvió una respuesta válida');
        }

        const data = await response.json();
        console.log('✅ [ReservaConfirmada] Data recibida:', data);

        console.log('[ReservaConfirmada] Respuesta del servidor:', data);

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Error al verificar el pago');
        }

        // Guardar datos completos de confirmación
        setConfirmacion(data);
        setReserva(data.reserva);
        setPaymentStatus(data.reserva.payment.status);

        // Si el pago fue exitoso, limpiar sessionStorage
        if (data.reserva.payment.status === 'paid') {
          sessionStorage.removeItem('photel_pre_reserva');
          console.log('[ReservaConfirmada] Pago confirmado, sessionStorage limpiado');
        }

        setLoading(false);
      } catch (err) {
        console.error('[ReservaConfirmada] Error al verificar pago:', err);
        setError(err.message || 'Error al verificar el pago');
        setLoading(false);
        toast.error('Error al verificar el pago', { duration: 2500 });
      }
    };

    verificarPago();
  }, [searchParams]);

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(Number(precio));
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <FaSpinner className="animate-spin text-green-600 text-5xl mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificando pago...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras confirmamos tu reserva
          </p>
        </div>
      </div>
    );
  }

  // Estado de error o pago no confirmado
  if (error || paymentStatus !== 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
            <FaExclamationTriangle className="text-orange-600 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error al verificar el pago' : 'Pago no confirmado'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'No se pudo confirmar tu pago. Si ya realizaste el pago, por favor intenta actualizar la página o contacta con soporte.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300"
            >
              Reintentar
            </button>
            <Link
              to="/habitaciones"
              className="inline-block bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-full border border-gray-300 transition-all duration-300"
            >
              Ver habitaciones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos de reserva (no debería pasar si llegamos aquí)
  if (!reserva) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No se encontraron datos</h2>
          <p className="text-gray-600 mb-6">
            No hay información de reserva para mostrar.
          </p>
          <Link 
            to="/habitaciones"
            className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300"
          >
            Ver habitaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Icono de éxito */}
        <div className="text-center mb-8 pt-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <FaCheckCircle className="text-green-600 text-5xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-lg text-gray-600">
            Tu reserva ha sido procesada exitosamente
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          {/* Header con código de reserva */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Código de reserva</p>
                <p className="text-white text-2xl font-bold">
                  #{reserva.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm font-medium">Estado</p>
                <span className="inline-block bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {reserva.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Detalles de la reserva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Habitación */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaBed className="text-green-600 text-lg" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Habitación</p>
                  <p className="text-gray-900 font-semibold">
                    {reserva.habitacion.nombre}
                  </p>
                </div>
              </div>

              {/* Huéspedes */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Huéspedes</p>
                  <p className="text-gray-900 font-semibold">
                    {reserva.huespedes.adultos} adulto{reserva.huespedes.adultos !== 1 ? 's' : ''}
                    {reserva.huespedes.ninios > 0 && ` + ${reserva.huespedes.ninios} niño${reserva.huespedes.ninios !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              {/* Fechas */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-purple-600 text-lg" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ingreso</p>
                  <p className="text-gray-900 font-semibold text-sm">
                    {formatearFecha(reserva.ingreso)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-purple-600 text-lg" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Egreso</p>
                  <p className="text-gray-900 font-semibold text-sm">
                    {formatearFecha(reserva.egreso)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total pagado</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    {formatearPrecio(reserva.total)}
                  </div>
                  <div className="text-xs text-gray-500">{reserva.moneda}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <FaEnvelope className="text-blue-600 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Confirmación enviada</h3>
              <p className="text-sm text-blue-800">
                Hemos enviado los detalles de tu reserva a tu correo electrónico. 
                Por favor, revisa tu bandeja de entrada y spam.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de descarga de factura */}
        {confirmacion?.ok && confirmacion?.reserva?.estado === 'Confirmada' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Tu factura está lista</h3>
              <p className="text-sm text-gray-600 mb-4">
                Descarga el comprobante de tu reserva en formato PDF
              </p>
              <a
                href={`${API}/facturas/${confirmacion.reserva.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 font-semibold text-white shadow-lg hover:bg-green-800 hover:shadow-xl transition-all duration-300"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                Descargar factura (PDF)
              </a>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/habitaciones"
            className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-full text-center transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Ver más habitaciones
          </Link>
          <Link
            to="/"
            className="inline-block bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-full text-center border border-gray-300 transition-all duration-300"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
