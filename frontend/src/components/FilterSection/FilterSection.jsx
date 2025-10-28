// src/components/FilterSection/FilterSection.jsx

import React from 'react';

/**
 * Componente de filtros dinámicos para la página de habitaciones
 * 
 * @param {Array<string>} categorias - Array de nombres de categorías del backend
 * @param {Array<string>} ocupaciones - Array de nombres de ocupaciones del backend
 * @param {string} categoriaSeleccionada - Categoría actualmente seleccionada
 * @param {string} ocupacionSeleccionada - Ocupación actualmente seleccionada
 * @param {Function} onCategoriaChange - Handler para cambio de categoría
 * @param {Function} onOcupacionChange - Handler para cambio de ocupación
 * @param {Function} onClearFilters - Handler para limpiar filtros
 */
export function FilterSection({ 
  categorias, 
  ocupaciones, 
  categoriaSeleccionada, 
  ocupacionSeleccionada,
  onCategoriaChange, 
  onOcupacionChange, 
  onClearFilters 
}) {
  return (
    <section className="filter-section">
      <h3 className="filter-title">Filtros de Búsqueda</h3>
      <div className="filter-controls">
        {/* Filtro de Categoría - Datos dinámicos del backend */}
        <div className="filter-group">
          <label htmlFor="category-select">Categoría</label>
          <select 
            id="category-select" 
            name="category" 
            value={categoriaSeleccionada} 
            onChange={onCategoriaChange}
          >
            <option value="Todas">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filtro de Tipo de Espacio (Ocupación) - Datos dinámicos del backend */}
        <div className="filter-group">
          <label htmlFor="space-select">Tipo de Espacio</label>
          <select 
            id="space-select" 
            name="spaceType" 
            value={ocupacionSeleccionada} 
            onChange={onOcupacionChange}
          >
            <option value="Todas">Todos los espacios</option>
            {ocupaciones.map(ocu => (
              <option key={ocu} value={ocu}>{ocu}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="filter-actions">
        <button className="btn-clear-filters" onClick={onClearFilters}>
          Limpiar Filtros
        </button>
      </div>
    </section>
  );
}