import React from 'react';

/**
 * Componente IconosClaveHabitacion
 * 
 * Muestra información clave de la habitación con iconos:
 * - Capacidad de huéspedes
 * - Descripción de camas
 * - Superficie (solo si existe)
 * 
 * @param {Object} ocupacion - Objeto con capacidad y descripcionCamas
 * @param {Number} superficie - Superficie en m² (opcional)
 */
export default function IconosClaveHabitacion({ ocupacion, superficie }) {
  return (
    <div className="flex flex-wrap items-center gap-6 py-6 px-6 bg-green-50/50 rounded-2xl border border-green-100">
      {/* Icono de Huéspedes */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">👤</span>
        <span className="text-gray-700 font-medium">
          Huéspedes: <span className="text-gray-900 font-semibold">{ocupacion.capacidad}</span>
        </span>
      </div>

      {/* Icono de Camas */}
      {ocupacion.descripcionCamas && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛌</span>
          <span className="text-gray-700 font-medium">
            Camas: <span className="text-gray-900 font-semibold">{ocupacion.descripcionCamas}</span>
          </span>
        </div>
      )}

      {/* Icono de Tamaño (solo si superficie existe) */}
      {superficie && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">📐</span>
          <span className="text-gray-700 font-medium">
            Tamaño: <span className="text-gray-900 font-semibold">{superficie} m²</span>
          </span>
        </div>
      )}
    </div>
  );
}
