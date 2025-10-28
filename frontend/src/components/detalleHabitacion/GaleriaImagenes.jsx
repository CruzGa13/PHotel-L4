import React, { useState } from 'react';

/**
 * Componente GaleriaImagenes
 * 
 * Muestra una galería de imágenes con:
 * - Imagen principal
 * - Flechas de navegación (centradas verticalmente)
 * - Miniaturas clickeables
 * - Contador de imágenes
 * 
 * @param {Array} imagenes - Array de objetos con url de imágenes
 * @param {String} nombreHabitacion - Nombre para alt text
 */
export default function GaleriaImagenes({ imagenes, nombreHabitacion }) {
  const [imagenActual, setImagenActual] = useState(0);

  // Si no hay imágenes, mostrar placeholder
  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
        <p className="text-gray-400">No hay imágenes disponibles</p>
      </div>
    );
  }

  const handleAnterior = () => {
    setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleSiguiente = () => {
    setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const handleMiniatura = (index) => {
    setImagenActual(index);
  };

  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <div className="relative w-full aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={imagenes[imagenActual]?.url}
          alt={`${nombreHabitacion} - Imagen ${imagenActual + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Flechas de Navegación - Centradas Verticalmente */}
        {imagenes.length > 1 && (
          <>
            {/* Flecha Izquierda */}
            <button
              onClick={handleAnterior}
              className="absolute top-1/2 left-4 -translate-y-1/2 
                         bg-white/90 hover:bg-white 
                         w-12 h-12 rounded-full 
                         flex items-center justify-center
                         shadow-lg hover:shadow-xl
                         transition-all duration-300 
                         hover:scale-110
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Imagen anterior"
            >
              <span className="text-2xl text-gray-800 font-bold">‹</span>
            </button>

            {/* Flecha Derecha */}
            <button
              onClick={handleSiguiente}
              className="absolute top-1/2 right-4 -translate-y-1/2 
                         bg-white/90 hover:bg-white 
                         w-12 h-12 rounded-full 
                         flex items-center justify-center
                         shadow-lg hover:shadow-xl
                         transition-all duration-300 
                         hover:scale-110
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Imagen siguiente"
            >
              <span className="text-2xl text-gray-800 font-bold">›</span>
            </button>

            {/* Contador de Imágenes */}
            <div className="absolute bottom-4 right-4 
                            bg-black/70 text-white 
                            px-3 py-1.5 rounded-full 
                            text-sm font-medium">
              {imagenActual + 1} / {imagenes.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas (solo si hay más de 1 imagen) */}
      {imagenes.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {imagenes.map((imagen, index) => (
            <button
              key={index}
              onClick={() => handleMiniatura(index)}
              className={`
                flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden
                border-2 transition-all duration-200
                ${
                  index === imagenActual
                    ? 'border-green-600 shadow-md scale-105'
                    : 'border-gray-200 hover:border-green-400 opacity-70 hover:opacity-100'
                }
              `}
            >
              <img
                src={imagen.url}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
