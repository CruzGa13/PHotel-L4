import React from 'react';
// Importa todos los iconos que necesitas (asegúrate que estén todos)
import {
  FaBath, FaSnowflake, FaTv, FaPhone, FaLock, FaWifi, FaKey,
  FaChair, FaCoffee, FaTemperatureHigh, FaDesktop
} from 'react-icons/fa';
import { MdDry, MdKitchen, MdRouter } from "react-icons/md";

// Objeto de mapeo (Traduce el string de la BD al componente del icono)
const iconMap = {
  'bath': <FaBath />,
  'ac_unit': <FaSnowflake />,
  'kitchen': <MdKitchen />,
  'tv': <FaTv />,
  'phone': <FaPhone />,
  'dryer': <MdDry />,
  'thermostat': <FaTemperatureHigh />,
  'lock': <FaLock />,
  'wifi': <FaWifi />,
  'key': <FaKey />,
  'desk': <FaDesktop />,
  'chair': <FaChair />,
  'coffee': <FaCoffee />,
  'wifi_tethering': <MdRouter />,
  'default': null
};

// Función helper para obtener el componente de icono
const getIconComponent = (iconString) => {
  if (!iconString) return iconMap.default;
  return iconMap[iconString.toLowerCase()] || iconMap.default;
};


export default function ListaAmenidades({ amenidades }) {
  // LOG INICIAL: Ver qué props recibe el componente
  console.log('🏨 [ListaAmenidades FINAL] Props recibidas:', amenidades);

  // Validación: verificar que sea un array válido y no vacío
  if (!Array.isArray(amenidades) || amenidades.length === 0) {
    console.warn('⚠️ [ListaAmenidades FINAL] No hay amenidades para mostrar o el formato es incorrecto.');
    return (
       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
         <h3 className="text-2xl font-bold text-gray-900 mb-6">Amenidades</h3>
         <p className="text-gray-500">No hay amenidades especificadas para esta habitación.</p>
       </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Amenidades</h3>

      {/* Grid de 2 columnas responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MAPEAMOS DIRECTAMENTE SOBRE EL ARRAY SIMPLE */}
        {amenidades.map((amenidad, index) => {
          // LOG POR ITEM: Ver la estructura de cada item
          console.log(`📌 [ListaAmenidades FINAL] Procesando item ${index}:`, amenidad);

          // ✅ ACCESO DIRECTO A PROPIEDADES (¡CORREGIDO!)
          const nombre = amenidad?.nombre;
          const iconoString = amenidad?.icono;

          // Validación: si no hay nombre, item malformado
          if (!nombre) {
            console.error(`❌ [ListaAmenidades FINAL] Item ${index} malformado - sin nombre:`, amenidad);
            return null; // No renderizar este item
          }

          // Obtener componente de icono
          const IconComponent = getIconComponent(iconoString);

          return (
            <div
              key={nombre || index} // Usa nombre como key si está disponible
              className="flex items-center gap-3 p-3
                         bg-gray-50 hover:bg-green-50/50
                         rounded-xl transition-all duration-200
                         hover:shadow-sm hover:translate-x-1
                         border border-transparent hover:border-green-100"
            >
              {/* Icono */}
              <div className="text-green-600 text-xl flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {IconComponent ? (
                   React.cloneElement(IconComponent, { className: "w-full h-full" })
                ) : (
                  // Muestra el nombre del icono si no se encontró componente, para depurar
                  <span className="text-xs text-red-500">{iconoString || '?'}</span>
                )}
              </div>

              {/* Nombre de la amenidad */}
              <span className="text-gray-700 font-medium text-sm">
                {nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}