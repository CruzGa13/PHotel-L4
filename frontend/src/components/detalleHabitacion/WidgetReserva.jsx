import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Componente WidgetReserva - Con flujo de disponibilidad
 * 
 * Widget lateral para consultar disponibilidad y crear pre-reserva:
 * - Selector de rango de fechas (DayPicker)
 * - Selectores de adultos y niños
 * - Consulta disponibilidad real (GET /api/disponibilidad)
 * - Modal de confirmación
 * - Crea pre-reserva (POST /api/pre-reservas)
 * - Navega a /resumen-reserva con datos en sessionStorage
 */
export default function WidgetReserva({ tipoHabitacionId, tarifaBase, ocupacion, habitacionNombre, huespedes }) {
  const navigate = useNavigate();
  
  // Estados de selección
  const [rangoFechas, setRangoFechas] = useState({ from: undefined, to: undefined });
  const [adultos, setAdultos] = useState(1);
  const [ninios, setNinios] = useState(0);
  
  // Estados de disponibilidad
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [disponibilidadData, setDisponibilidadData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para creación de pre-reserva
  const [isCreatingPreReserva, setIsCreatingPreReserva] = useState(false);

  // Formatear precio en ARS con 2 decimales
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(precio));
  };

  // Validar capacidad total
  const totalPersonas = adultos + ninios;
  const maxCap = ocupacion?.capacidad ?? 1;
  const capacityOK = totalPersonas <= maxCap;

  /**
   * Consultar disponibilidad en el backend
   */
  const handleConsultarDisponibilidad = async () => {
    console.log('🔍 [handleConsultarDisponibilidad] Iniciando consulta');
    console.log('📊 [Estado] API URL:', API);
    console.log('📊 [Estado] Rango fechas:', rangoFechas);
    console.log('📊 [Estado] Adultos:', adultos, 'Niños:', ninios);
    console.log('📊 [Estado] Capacity OK:', capacityOK);

    // Validaciones
    if (!rangoFechas.from || !rangoFechas.to) {
      console.log('❌ [Validación] Fechas no seleccionadas');
      toast.error('Seleccioná las fechas de ingreso y egreso');
      return;
    }

    if (!capacityOK) {
      console.log('❌ [Validación] Capacidad excedida');
      toast.error(`Capacidad excedida (máximo ${maxCap} personas)`);
      return;
    }

    setIsCheckingAvailability(true);

    try {
      const ingreso = rangoFechas.from.toISOString().split('T')[0];
      const egreso = rangoFechas.to.toISOString().split('T')[0];
      
      const url = `${API}/disponibilidad?tipoHabitacionId=${tipoHabitacionId}&ingreso=${ingreso}&egreso=${egreso}&adultos=${adultos}&ninios=${ninios}`;
      console.log('📡 [Disponibilidad] URL completa:', url);

      const response = await fetch(url);
      console.log('📡 [Disponibilidad] Response status:', response.status);
      
      const data = await response.json();
      console.log('📡 [Disponibilidad] Response data:', data);

      if (!response.ok) {
        console.log('❌ [Disponibilidad] Response not OK:', response.status, data);
        throw new Error(data.error || 'Error al consultar disponibilidad');
      }

      console.log('✅ [Disponibilidad] Respuesta exitosa:', data);
      setDisponibilidadData(data);
      setShowModal(true);

    } catch (error) {
      console.error('❌ [Disponibilidad] Error completo:', error);
      console.error('❌ [Disponibilidad] Error message:', error.message);
      console.error('❌ [Disponibilidad] Error stack:', error.stack);
      toast.error(error.message || 'Error al consultar disponibilidad');
    } finally {
      console.log('🏁 [Disponibilidad] Finalizando consulta');
      setIsCheckingAvailability(false);
    }
  };

  /**
   * Crear pre-reserva y navegar a resumen
   */
  const handleContinuarPreReserva = async () => {
    setIsCreatingPreReserva(true);

    try {
      const ingreso = rangoFechas.from.toISOString().split('T')[0];
      const egreso = rangoFechas.to.toISOString().split('T')[0];

      const body = {
        tipoHabitacionId,
        ingreso,
        egreso,
        adultos,
        ninios
      };

      console.log('[Pre-reserva] Creando:', body);

      const response = await fetch(`${API}/pre-reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear pre-reserva');
      }

      console.log('[Pre-reserva] Creada:', data);

      // Guardar en sessionStorage
      const preReservaData = {
        holdId: data.holdId,
        snapshot: data.snapshot,
        ingreso,
        egreso,
        adultos,
        ninios
      };

      sessionStorage.setItem('photel_pre_reserva', JSON.stringify(preReservaData));
      
      toast.success('Pre-reserva creada exitosamente');
      
      // Navegar a resumen
      navigate('/resumen-reserva');

    } catch (error) {
      console.error('[Pre-reserva] Error:', error);
      toast.error(error.message || 'Error al crear pre-reserva');
    } finally {
      setIsCreatingPreReserva(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
      {/* Título */}
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Reservar Ahora
      </h3>

      {/* Precio */}
      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-green-700">
            {formatearPrecio(tarifaBase).split(',')[0]}
          </span>
          <span className="text-xl font-bold text-green-700">
            ,{formatearPrecio(tarifaBase).split(',')[1]?.replace(/[^\d]/g, '')}
          </span>
          <span className="text-sm text-gray-500 font-normal ml-1">/noche</span>
        </div>
      </div>

      {/* Selector de Fechas */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Selecciona tus fechas
        </label>

        {/* DayPicker con estilos personalizados */}
        <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
          <DayPicker
            mode="range"
            selected={rangoFechas}
            onSelect={setRangoFechas}
            disabled={{ before: new Date() }}
            locale={es}
            numberOfMonths={1}
            modifiersClassNames={{
              selected: 'bg-green-600 text-white hover:bg-green-700',
              today: 'font-bold text-green-600',
            }}
            className="!m-0"
            styles={{
              caption: { color: '#374151', fontWeight: '600' },
              head_cell: { color: '#6b7280', fontWeight: '500', fontSize: '0.875rem' },
              day: { fontSize: '0.875rem' },
            }}
          />
        </div>

        {/* Mostrar fechas seleccionadas */}
        {rangoFechas.from && rangoFechas.to && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Llegada:</span>
              <span className="text-gray-900 font-semibold">
                {rangoFechas.from.toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Salida:</span>
              <span className="text-gray-900 font-semibold">
                {rangoFechas.to.toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Huéspedes */}
      <div className="mb-6 space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Huéspedes
        </label>
        
        {/* Adultos */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-gray-700 font-medium">Adultos</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAdultos(Math.max(1, adultos - 1))}
              className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={adultos <= 1}
            >
              -
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">{adultos}</span>
            <button
              type="button"
              onClick={() => setAdultos(Math.min(maxCap, adultos + 1))}
              className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={totalPersonas >= maxCap}
            >
              +
            </button>
          </div>
        </div>

        {/* Niños */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-gray-700 font-medium">Niños</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNinios(Math.max(0, ninios - 1))}
              className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={ninios <= 0}
            >
              -
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">{ninios}</span>
            <button
              type="button"
              onClick={() => setNinios(Math.min(maxCap - adultos, ninios + 1))}
              className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={totalPersonas >= maxCap}
            >
              +
            </button>
          </div>
        </div>

        {/* Capacidad info */}
        <div className="text-xs text-gray-500 text-center">
          Capacidad máxima: {maxCap} persona{maxCap !== 1 ? 's' : ''}
          {!capacityOK && <span className="text-red-600 font-semibold"> - Capacidad excedida</span>}
        </div>
      </div>

      {/* Botón Consultar Disponibilidad */}
      <button
        onClick={handleConsultarDisponibilidad}
        disabled={!rangoFechas.from || !rangoFechas.to || !capacityOK || isCheckingAvailability}
        className={`w-full font-semibold py-4 px-6 rounded-full
                   shadow-lg hover:shadow-xl
                   transition-all duration-300
                   transform hover:scale-[1.02] active:scale-[0.98]
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                   ${!rangoFechas.from || !rangoFechas.to || !capacityOK || isCheckingAvailability
                     ? 'bg-gray-400 cursor-not-allowed text-white' 
                     : 'bg-green-700 hover:bg-green-800 text-white'
                   }`}
      >
        {isCheckingAvailability ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Consultando...
          </span>
        ) : (
          'Consultar disponibilidad'
        )}
      </button>

      {/* Nota informativa */}
      <p className="text-center text-xs text-gray-500 mt-4">
        {!rangoFechas.from || !rangoFechas.to 
          ? 'Seleccioná las fechas para continuar'
          : !capacityOK
          ? 'Ajustá la cantidad de huéspedes'
          : 'Verificá disponibilidad antes de continuar'
        }
      </p>

      {/* Modal de Disponibilidad */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          {disponibilidadData?.availableCount > 0 && disponibilidadData?.capacityOK ? (
            // Modal de disponibilidad exitosa
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-700">¡Disponible!</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Habitación disponible para las fechas seleccionadas.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3 py-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Noches:</span>
                  <span className="font-semibold text-gray-900">{disponibilidadData.nights}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Tarifa/noche:</span>
                  <span className="font-semibold text-gray-900">{formatearPrecio(disponibilidadData.nightlyRate)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="font-bold text-green-700 text-xl">{formatearPrecio(disponibilidadData.total)}</span>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isCreatingPreReserva}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleContinuarPreReserva}
                  disabled={isCreatingPreReserva}
                  className="bg-green-700 hover:bg-green-800"
                >
                  {isCreatingPreReserva ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </span>
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            // Modal de sin disponibilidad
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-red-600">Sin disponibilidad</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {disponibilidadData?.messages?.length > 0
                    ? disponibilidadData.messages.join(' ')
                    : 'No hay habitaciones disponibles para esas fechas o la capacidad está excedida.'}
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
