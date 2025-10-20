// src/pages/habitaciones/components/FilterSection.jsx

import React from 'react';

export function FilterSection({ filters, onFilterChange, onClearFilters }) {
  return (
    <section className="filter-section">
      <h3 className="filter-title">Filtros de Búsqueda</h3>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="category-select">Categoría</label>
          <select id="category-select" name="category" value={filters.category} onChange={onFilterChange}>
            <option value="todos">Todas las categorías</option>
            <option value="Estandar">Estándar</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Ejecutivo">Ejecutivo</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="space-select">Tipo de Espacio</label>
          <select id="space-select" name="spaceType" value={filters.spaceType} onChange={onFilterChange}>
            <option value="todos">Todos los espacios</option>
            <option value="individual">Individual</option>
            <option value="dobleQueen">Doble Queen</option>
            <option value="dobleTwin">Doble Twin</option>
            <option value="tripleQueen">Triple Queen</option>
            <option value="tripleTwin">Triple Twin</option>
            <option value="cuadrupleQueen">Cuádruple Queen</option>
            <option value="cuadrupleTwin">Cuádruple Twin</option>
          </select>
        </div>
      </div>
      <div className="filter-actions">
        <button className="btn-clear-filters" onClick={onClearFilters}>Limpiar Filtros</button>
      </div>
    </section>
  );
}