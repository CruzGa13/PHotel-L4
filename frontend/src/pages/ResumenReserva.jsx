import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BreadCrumb from '../components/BreadCrumb/BreadCrumb';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/auth/AuthModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Componente ResumenReserva
 * 
 * Página de resumen de pre-reserva que muestra:
 * - Detalles de la habitación y fechas (desde sessionStorage)
 * - Resumen de precios con snapshot
 * - Botón de confirmación (deshabilitado por ahora)
 * 
 * Lee datos desde sessionStorage (clave: photel_pre_reserva)
 */
export default function ResumenReserva() {
  const navigate = useNavigate();
  const { user, openAuthModal, authModalOpen, closeAuthModal } = useAuth();
  
  const [preReservaData, setPreReservaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);

  // Cargar datos desde sessionStorage
  useEffect(() => {
    const dataStr = sessionStorage.getItem('photel_pre_reserva');
    
    if (!dataStr) {
      toast.error('No hay una pre-reserva activa');
      navigate('/habitaciones');
      return;
    }

    try {
      const data = JSON.parse(dataStr);
      
      if (!data.holdId || !data.snapshot) {
        throw new Error('Datos de pre-reserva incompletos');
      }

      setPreReservaData(data);
      console.log('[ResumenReserva] Datos cargados:', data);
    } catch (error) {
      console.error('[ResumenReserva] Error al parsear:', error);
      toast.error('Error al cargar la pre-reserva');
      navigate('/habitaciones');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  // Si no hay datos después de loading
  if (!preReservaData) {
    return null;
  }

  const { snapshot, ingreso, egreso, adultos, ninios } = preReservaData;

  // Construir breadcrumb items desde snapshot
  const nombreHabitacion = snapshot?.nombre ?? 'Detalle';
  const idHabitacion = snapshot?.tipoHabitacionId;
  const linkDetalle = idHabitacion ? `/habitaciones/${idHabitacion}` : '/habitaciones';
  
  const breadcrumbItems = [
    { label: "Inicio", to: "/" },
    { label: "Nuestras habitaciones", to: "/habitaciones" },
    { label: nombreHabitacion, to: linkDetalle },
    { label: "Pre-reserva", current: true }
  ];

  // Formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(precio));
  };

  // Formatear fechas
  const formatearFecha = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Handler para renovar el hold (crear una nueva pre-reserva con los mismos datos)
   */
  const handleRenovarHold = async () => {
    if (isRenewing || !preReservaData?.snapshot) return;
    
    setIsRenewing(true);
    console.log('🔄 [ResumenReserva] Renovando hold...');
    
    try {
      const { snapshot, ingreso, egreso, adultos, ninios } = preReservaData;
      
      // Crear nueva pre-reserva con los mismos datos
      const body = {
        tipoHabitacionId: snapshot.tipoHabitacionId,
        ingreso,
        egreso,
        adultos,
        ninios
      };

      console.log('📡 [ResumenReserva] Creando nueva pre-reserva:', body);

      const response = await fetch(`${API}/pre-reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al renovar la pre-reserva');
      }

      console.log('✅ [ResumenReserva] Hold renovado:', data.holdId);

      // Actualizar sessionStorage con el nuevo hold
      const newPreReservaData = {
        holdId: data.holdId,
        snapshot: data.snapshot,
        ingreso,
        egreso,
        adultos,
        ninios
      };

      sessionStorage.setItem('photel_pre_reserva', JSON.stringify(newPreReservaData));
      setPreReservaData(newPreReservaData);
      
      toast.success('⏱️ Pre-reserva renovada por 15 minutos más', { duration: 3000 });

    } catch (error) {
      console.error('❌ [ResumenReserva] Error al renovar hold:', error);
      toast.error(error.message || 'No se pudo renovar la pre-reserva', { duration: 3000 });
    } finally {
      setIsRenewing(false);
    }
  };

  /**
   * Handler para cancelar la pre-reserva
   */
  const handleCancelar = () => {
    sessionStorage.removeItem('photel_pre_reserva');
    toast.success('Pre-reserva cancelada');
    navigate(-1);
  };

  /**
   * Handler para confirmar la reserva y proceder al pago
   * Evita doble ejecución con useRef
   */
  const handleConfirmarReserva = async () => {
    console.log('🚀 [Confirmación] Iniciando proceso de confirmación');
    console.log('📊 [Confirmación] API URL:', API);
    
    // Guarda contra reentrancia
    if (isSubmittingRef.current) {
      console.warn('⚠️ [Pago] ejecución en curso, ignorando');
      return;
    }

    try {
      toast.dismiss();

      // 0) Validar pre-reserva
      const raw = sessionStorage.getItem('photel_pre_reserva');
      console.log('📦 [Pago] SessionStorage raw:', raw);
      
      if (!raw) {
        console.log('❌ [Pago] No hay pre-reserva en sessionStorage');
        toast.error('No hay pre-reserva activa', { duration: 2500 });
        navigate('/habitaciones');
        return;
      }
      const pre = JSON.parse(raw);
      console.info('✅ [Pago] Pre-reserva encontrada:', pre);
      console.info('🔑 [Pago] HoldId:', pre.holdId);

      // Validar login antes de activar flags
      if (!user) {
        console.log('👤 [Pago] Usuario no autenticado, abriendo modal de login');
        openAuthModal({ 
          reason: 'checkout', 
          onSuccess: () => setTimeout(() => handleConfirmarReserva(), 500) 
        });
        return;
      }
      console.log('✅ [Pago] Usuario autenticado:', user.email);

      // Obtener token de sesión
      console.log('🔐 [Pago] Obteniendo sesión de Supabase...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [Pago] Error al obtener sesión:', sessionError);
      }
      
      if (sessionError || !session?.access_token) {
        console.log('❌ [Pago] Sesión inválida o sin token');
        toast.error('Sesión inválida. Iniciá sesión nuevamente.', { duration: 2500 });
        openAuthModal({ 
          reason: 'checkout', 
          onSuccess: () => setTimeout(() => handleConfirmarReserva(), 500) 
        });
        return;
      }
      console.log('✅ [Pago] Sesión válida, token obtenido');

      // Activar flags SOLO después de validaciones previas
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      // 1) Crear reserva
      const reservasUrl = `${API}/reservas`;
      console.info('📡 [Pago] Creando reserva en:', reservasUrl);
      console.info('🔑 [Pago] Enviando holdId:', pre.holdId);
      
      const r1 = await fetch(reservasUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ holdId: pre.holdId }),
      });
      
      console.log('📡 [Pago] Response status crear reserva:', r1.status);

      if (!r1.ok) {
        const txt = await r1.text().catch(() => '');
        let errorData;
        try {
          errorData = JSON.parse(txt);
        } catch {
          errorData = { error: txt };
        }
        
        console.error('❌ [Pago] Error creando reserva. Status:', r1.status);
        console.error('❌ [Pago] Response:', errorData);
        
        // Mensajes específicos según el error
        if (r1.status === 404 || errorData.error?.includes('Hold no encontrado')) {
          toast.error('⏱️ La pre-reserva expiró. Por favor, consultá disponibilidad nuevamente.', { 
            duration: 4000 
          });
          setTimeout(() => {
            sessionStorage.removeItem('photel_pre_reserva');
            navigate('/habitaciones');
          }, 2000);
        } else if (r1.status === 409) {
          toast.error('La habitación ya no está disponible. Por favor, intentá con otras fechas.', { 
            duration: 4000 
          });
          setTimeout(() => {
            sessionStorage.removeItem('photel_pre_reserva');
            navigate('/habitaciones');
          }, 2000);
        } else {
          toast.error(errorData.error || 'No se pudo crear la reserva', { duration: 2500 });
        }
        return;
      }

      const dataReserva = await r1.json();
      console.info('[Pago] dataReserva RAW:', dataReserva);
      
      // Extraer reservaId de forma robusta
      const reservaId = 
        dataReserva?.id ?? 
        dataReserva?.reservaId ?? 
        dataReserva?.reserva?.id ?? 
        dataReserva?.data?.id ?? 
        null;

      if (!reservaId || !Number.isFinite(Number(reservaId))) {
        console.error('[Pago] No se pudo obtener reservaId:', dataReserva);
        toast.error('Respuesta inválida al crear reserva', { duration: 2500 });
        return;
      }
      console.info('[Pago] Reserva creada:', reservaId);

      // 2) Crear checkout session
      const checkoutUrl = `${API}/pagos/checkout-session`;
      console.info('📡 [Pago] Creando checkout session en:', checkoutUrl);
      console.info('🔑 [Pago] Solicitando checkout para reserva:', reservaId);
      
      const r2 = await fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservaId }),
      });
      
      console.log('📡 [Pago] Response status checkout:', r2.status);

      if (!r2.ok) {
        const txt = await r2.text().catch(() => '');
        console.error('❌ [Pago] Error creando checkout. Status:', r2.status);
        console.error('❌ [Pago] Response text:', txt);
        toast.error('No se pudo iniciar el pago', { duration: 2500 });
        return;
      }

      const dataCheckout = await r2.json();
      console.info('[Pago] Checkout session:', dataCheckout?.sessionId);
      console.info('[Pago] URL recibida:', dataCheckout?.url);

      if (!dataCheckout?.url) {
        console.error('[Pago] No se recibió URL de Stripe:', dataCheckout);
        toast.error('Respuesta inválida del pago', { duration: 2500 });
        return;
      }

      // 3) Limpiar y redirigir a Stripe
      console.info('✅ [Pago] Todo OK, preparando redirección...');
      console.info('🌐 [Pago] URL de Stripe:', dataCheckout.url);
      
      sessionStorage.removeItem('photel_pre_reserva');
      toast.dismiss();
      
      console.info('🚀 [Pago] Redirigiendo a Stripe ahora...');
      // OBLIGATORIO: usar window.location.href (NO navigate)
      window.location.href = dataCheckout.url;

    } catch (err) {
      console.error('❌ [Pago] Excepción capturada:', err);
      console.error('❌ [Pago] Error name:', err.name);
      console.error('❌ [Pago] Error message:', err.message);
      console.error('❌ [Pago] Error stack:', err.stack);
      toast.error('Ocurrió un error al confirmar', { duration: 2500 });
    } finally {
      // Liberar locks siempre
      console.log('🏁 [Pago] Finalizando proceso');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb controlado */}
        <div className="pt-2 mb-4">
          <BreadCrumb mode="controlled" items={breadcrumbItems} />
        </div>

        {/* Título Principal */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            Resumen de Pre-reserva
          </h1>
          <p className="text-lg text-gray-600">
            Revisa los detalles antes de confirmar
          </p>
        </div>

        {/* Alerta de tiempo */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">Pre-reserva activa.</span> Tenés aproximadamente <span className="font-semibold">15 minutos</span> para confirmarla.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Si necesitás más tiempo, podés renovar tu pre-reserva.
                </p>
              </div>
            </div>
            <button
              onClick={handleRenovarHold}
              disabled={isRenewing}
              className="ml-4 flex-shrink-0 text-xs font-medium text-yellow-700 hover:text-yellow-800 border border-yellow-400 hover:border-yellow-500 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRenewing ? '⏳ Renovando...' : '🔄 Renovar'}
            </button>
          </div>
        </div>

        {/* Contenedor de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: Detalles de la Reserva */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Información de la Habitación */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                <span className="text-2xl mr-2">🏨</span>
                {snapshot.nombre}
              </h2>
              
              <div className="space-y-4">
                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Ingreso</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatearFecha(ingreso)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Egreso</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatearFecha(egreso)}
                    </p>
                  </div>
                </div>

                {/* Huéspedes */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Huéspedes</p>
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      <span className="font-medium">{adultos} adulto{adultos !== 1 ? 's' : ''}</span>
                    </div>
                    {ninios > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👶</span>
                        <span className="font-medium">{ninios} niño{ninios !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Noches */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600 font-medium">Total de noches:</span>
                  <span className="text-green-700 font-bold text-lg">
                    {snapshot.nights} {snapshot.nights === 1 ? 'noche' : 'noches'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Políticas de Reserva (genéricas) */}
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

            {/* Card: Políticas de la habitación (si existen) */}
            {snapshot.politicas && snapshot.politicas.trim() && (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">📋</span>
                  Políticas de la habitación
                </h3>
                {snapshot.politicas.includes('\n') ? (
                  <ul className="space-y-2 text-sm text-green-800">
                    {snapshot.politicas.split('\n').filter(line => line.trim()).map((line, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{line.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-800">
                    {snapshot.politicas}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Resumen de Precios */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-green-700 mb-6">
                Resumen de Precios
              </h2>

              <div className="space-y-4 mb-6">
                {/* Detalles de precio */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm text-gray-700">
                    <span>Noches:</span>
                    <span className="font-semibold">{snapshot.nights}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-700">
                    <span>Tarifa por noche:</span>
                    <span className="font-semibold">{formatearPrecio(snapshot.nightlyRate)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-4">
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">
                        {formatearPrecio(snapshot.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {snapshot.currency}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                {/* Botón de Confirmación (ACTIVO) */}
                <button
                  onClick={handleConfirmarReserva}
                  disabled={isSubmitting}
                  className={`w-full font-bold py-4 px-6 rounded-full
                           shadow-lg hover:shadow-xl
                           transition-all duration-300
                           transform hover:scale-[1.02] active:scale-[0.98]
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                           ${isSubmitting
                             ? 'bg-gray-400 cursor-not-allowed text-white'
                             : 'bg-green-700 hover:bg-green-800 text-white'
                           }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar reserva'
                  )}
                </button>

                {/* Botón Cancelar */}
                <button
                  onClick={handleCancelar}
                  className="w-full py-3 px-6 rounded-full
                           border border-gray-300 text-gray-700
                           hover:bg-gray-50
                           transition-colors duration-200"
                >
                  Cancelar pre-reserva
                </button>
              </div>

              {/* Nota informativa */}
              {!user && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  🔒 Se requiere inicio de sesión para confirmar
                </p>
              )}
              {user && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  🔒 Transacción segura y protegida
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* AuthModal controlado desde contexto */}
      <AuthModal open={authModalOpen} onOpenChange={closeAuthModal} />
    </div>
  );
}
