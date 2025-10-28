import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

/**
 * Componente WidgetReserva - REFACTORIZADO
 * 
 * Widget lateral simplificado para reservar habitación:
 * - Selector de rango de fechas (DayPicker)
 * - Cálculo automático de precio total (sin llamada a API)
 * - Información de capacidad
 * - Botón "Reservar" que navega a página de resumen
 * 
 * @param {Number} tipoHabitacionId - ID del tipo de habitación
 * @param {String|Number} tarifaBase - Precio por noche
 * @param {Object} ocupacion - Objeto con capacidad
 * @param {String} habitacionNombre - Nombre de la habitación
 * @param {Number} huespedes - Número de huéspedes
 */
export default function WidgetReserva({ tipoHabitacionId, tarifaBase, ocupacion, habitacionNombre, huespedes }) {
  // Hook de navegación
  const navigate = useNavigate();
  // Estado para rango de fechas seleccionado
  const [rangoFechas, setRangoFechas] = useState({ from: undefined, to: undefined });
  
  // Estados para cálculo automático de precio
  const [precioCalculado, setPrecioCalculado] = useState(null);
  const [nochesCalculadas, setNochesCalculadas] = useState(null);

  // Formatear precio en ARS con 2 decimales
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(precio));
  };

  /**
   * useEffect: Cálculo automático de precio cuando cambian las fechas
   * Se ejecuta cada vez que rangoFechas cambia
   */
  useEffect(() => {
    const { from: fechaLlegada, to: fechaSalida } = rangoFechas;

    // Si ambas fechas están seleccionadas
    if (fechaLlegada && fechaSalida) {
      // Validar que fechaSalida sea posterior a fechaLlegada
      if (fechaSalida > fechaLlegada) {
        // Calcular número de noches
        const milisegundosPorDia = 1000 * 60 * 60 * 24;
        const diferenciaMs = fechaSalida.getTime() - fechaLlegada.getTime();
        const noches = Math.ceil(diferenciaMs / milisegundosPorDia);

        // Calcular precio total
        const precioTotal = Number(tarifaBase) * noches;

        // Actualizar estados
        setNochesCalculadas(noches);
        setPrecioCalculado(precioTotal);

        // Log para depuración
        console.log('💰 [WidgetReserva] Cálculo automático:', {
          fechaLlegada: fechaLlegada.toISOString().split('T')[0],
          fechaSalida: fechaSalida.toISOString().split('T')[0],
          noches,
          tarifaBase: Number(tarifaBase),
          precioTotal
        });
      } else {
        // Fechas inválidas (salida no es posterior a llegada)
        setNochesCalculadas(null);
        setPrecioCalculado(null);
        console.warn('⚠️ [WidgetReserva] Fecha de salida no es posterior a llegada');
      }
    } else {
      // Fechas incompletas
      setNochesCalculadas(null);
      setPrecioCalculado(null);
    }
  }, [rangoFechas, tarifaBase]); // Dependencias: se ejecuta cuando cambian rangoFechas o tarifaBase

  /**
   * Handler para el botón Reservar
   * Navega a la página de resumen con todos los datos de la reserva
   */
  const handleReservar = () => {
    // 1. Crear el objeto de datos de reserva
    const reservaData = {
      tipoHabitacionId,
      habitacionNombre,
      huespedes,
      checkIn: rangoFechas.from,
      checkOut: rangoFechas.to,
      noches: nochesCalculadas,
      precioNoche: Number(tarifaBase),
      precioTotal: precioCalculado
    };
    
    // 2. Log para depuración
    console.log('🚀 [WidgetReserva] Navegando a Resumen con datos:', reservaData);

    // 3. Navegar a la página de resumen pasando los datos
    navigate('/resumen-reserva', { state: { reservaData } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
      {/* Título */}
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Reservar Ahora
      </h3>

      {/* Precio */}
      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        {precioCalculado && nochesCalculadas ? (
          // Mostrar precio calculado de la estancia
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Precio total por {nochesCalculadas} noche(s):
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-green-700">
                {formatearPrecio(precioCalculado).split(',')[0]}
              </span>
              <span className="text-2xl font-bold text-green-700">
                ,{formatearPrecio(precioCalculado).split(',')[1]?.replace(/[^\d]/g, '')}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              ({formatearPrecio(tarifaBase)} por noche)
            </div>
          </div>
        ) : (
          // Mostrar tarifa base por noche
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-green-700">
              {formatearPrecio(tarifaBase).split(',')[0]}
            </span>
            <span className="text-xl font-bold text-green-700">
              ,{formatearPrecio(tarifaBase).split(',')[1]?.replace(/[^\d]/g, '')}
            </span>
            <span className="text-sm text-gray-500 font-normal ml-1">/noche</span>
          </div>
        )}
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

      {/* Huéspedes (Capacidad) */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Capacidad
        </label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-2xl">👥</span>
          <span className="text-gray-700 font-medium">
            Para hasta <span className="font-bold text-gray-900">{ocupacion.capacidad}</span> huésped(es)
          </span>
        </div>
      </div>

      {/* Botón Reservar */}
      <button
        onClick={handleReservar}
        disabled={!rangoFechas.from || !rangoFechas.to}
        className={`w-full font-semibold py-4 px-6 rounded-full
                   shadow-lg hover:shadow-xl
                   transition-all duration-300
                   transform hover:scale-[1.02] active:scale-[0.98]
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                   ${!rangoFechas.from || !rangoFechas.to
                     ? 'bg-gray-400 cursor-not-allowed text-white' 
                     : 'bg-green-700 hover:bg-green-800 text-white'
                   }`}
      >
        Reservar
      </button>

      {/* Nota informativa */}
      <p className="text-center text-xs text-gray-500 mt-4">
        {!rangoFechas.from || !rangoFechas.to 
          ? 'Selecciona las fechas para continuar'
          : 'No se realizará ningún cargo todavía'
        }
      </p>
    </div>
  );
}
