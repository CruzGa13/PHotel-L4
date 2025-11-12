import React from 'react';

/**
 * Badge para mostrar el estado de una habitación
 * @param {Object} props
 * @param {'Disponible' | 'Ocupada' | 'Mantenimiento'} props.estado
 */
export default function StateBadge({ estado }) {
  const getStateStyles = () => {
    switch (estado) {
      case 'Disponible':
        return 'bg-emerald-100 text-emerald-700';
      case 'Ocupada':
        return 'bg-amber-100 text-amber-700';
      case 'Mantenimiento':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStateStyles()}`}
    >
      {estado}
    </span>
  );
}
