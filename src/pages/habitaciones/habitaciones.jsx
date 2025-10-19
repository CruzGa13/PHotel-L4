import React, { useState, useEffect } from "react";
import { habitaciones } from "../../assets/assets.js";
import { RoomCard } from "../../components/RoomCard/RoomCard";
import { FilterSection } from "../../components/FilterSection/FilterSection";
import "./habitaciones.css";

export default function HabitacionesPage() {
  const [filters, setFilters] = useState({ category: "todos", spaceType: "todos" });
  const [filteredHabitaciones, setFilteredHabitaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      let result = habitaciones;
      if (filters.category !== "todos") {
        result = result.filter((h) => h.category === filters.category);
      }
      if (filters.spaceType !== "todos") {
        result = result.filter((h) => h.spaceType === filters.spaceType);
      }
      setFilteredHabitaciones(result);
      setIsLoading(false);
    }, 300); 
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ category: "todos", spaceType: "todos" });

  return (
    <div className="habitaciones-page">
      <main className="habitaciones-container">
        <header className="page-header">
          <h2 className="page-title">Nuestras Habitaciones</h2>
          <p className="page-subtitle">Encuentra el espacio perfecto para tu estancia</p>
        </header>
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
        <div className="room-grid">
          {isLoading ? (
            <p className="loading-message">Cargando habitaciones...</p>
          ) : filteredHabitaciones.length > 0 ? (
            filteredHabitaciones.map((habitacion) => (
              <RoomCard key={habitacion._id} habitacion={habitacion} />
            ))
          ) : (
            <div className="no-results">
              <h3>No se encontraron habitaciones</h3>
              <p>Intenta ajustar los filtros para ver más opciones.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}