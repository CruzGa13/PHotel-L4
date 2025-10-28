import React, { useState, useEffect } from "react";
import { RoomCard } from "../../components/RoomCard/RoomCard";
import { FilterSection } from "../../components/FilterSection/FilterSection";
import "./habitaciones.css";

const API_BASE_URL = 'http://localhost:3000/api';

export default function HabitacionesPage() {
  // Estados para datos del backend
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [categoriasFiltro, setCategoriasFiltro] = useState([]);
  const [ocupacionesFiltro, setOcupacionesFiltro] = useState([]);
  
  // Estados para filtros
  const [filtroCategoriaSeleccionada, setFiltroCategoriaSeleccionada] = useState("Todas");
  const [filtroOcupacionSeleccionada, setFiltroOcupacionSeleccionada] = useState("Todas");
  
  // Estados para UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de datos desde las 3 APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch en paralelo de las 3 APIs
        const [tiposRes, categoriasRes, ocupacionesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tipos-habitacion`),
          fetch(`${API_BASE_URL}/categorias`),
          fetch(`${API_BASE_URL}/ocupaciones`)
        ]);

        // Verificar que todas las respuestas sean exitosas
        if (!tiposRes.ok || !categoriasRes.ok || !ocupacionesRes.ok) {
          throw new Error('Error al cargar los datos del servidor');
        }

        // Parsear JSON
        const [tiposData, categoriasData, ocupacionesData] = await Promise.all([
          tiposRes.json(),
          categoriasRes.json(),
          ocupacionesRes.json()
        ]);

        // Actualizar estados
        setTiposHabitacion(tiposData);
        setCategoriasFiltro(categoriasData);
        setOcupacionesFiltro(ocupacionesData);

        console.log('✅ Datos cargados exitosamente:', {
          tipos: tiposData.length,
          categorias: categoriasData,
          ocupaciones: ocupacionesData
        });

      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError(err.message || 'Error al cargar las habitaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Solo se ejecuta al montar el componente

  // Lógica de filtrado
  const tiposFiltrados = tiposHabitacion.filter(tipo => {
    const matchCategoria = filtroCategoriaSeleccionada === "Todas" || 
                          tipo.categoria.nombre === filtroCategoriaSeleccionada;
    
    const matchOcupacion = filtroOcupacionSeleccionada === "Todas" || 
                          tipo.ocupacion.nombre === filtroOcupacionSeleccionada;
    
    return matchCategoria && matchOcupacion;
  });

  // Handlers para filtros
  const handleCategoriaChange = (e) => {
    setFiltroCategoriaSeleccionada(e.target.value);
  };

  const handleOcupacionChange = (e) => {
    setFiltroOcupacionSeleccionada(e.target.value);
  };

  const clearFilters = () => {
    setFiltroCategoriaSeleccionada("Todas");
    setFiltroOcupacionSeleccionada("Todas");
  };

  // Adaptador: Convierte los datos del backend al formato que espera RoomCard
  const adaptarDatosParaCard = (tipo) => {
    return {
      _id: tipo.id,
      name: tipo.nombre,
      description: tipo.descripcion,
      image1: tipo.imagenes[0]?.url || '/placeholder-room.jpg', // Imagen 1 o placeholder
      image2: tipo.imagenes[1]?.url || tipo.imagenes[0]?.url || '/placeholder-room.jpg', // Imagen 2 o repetir 1
      huespedes: tipo.ocupacion.capacidad,
      price: tipo.tarifaBase,
      category: tipo.categoria.nombre,
      spaceType: tipo.ocupacion.nombre
    };
  };

  return (
    <div className="habitaciones-page">
      {/* CORRECCIÓN 1: Centrar contenido principal - Agregado mx-auto para centrar horizontalmente */}
      <main className="habitaciones-container mx-auto">
        <header className="page-header">
          <h2 className="page-title">Nuestras Habitaciones</h2>
          <p className="page-subtitle">Encuentra el espacio perfecto para tu estancia</p>
        </header>
        <FilterSection
          categorias={categoriasFiltro}
          ocupaciones={ocupacionesFiltro}
          categoriaSeleccionada={filtroCategoriaSeleccionada}
          ocupacionSeleccionada={filtroOcupacionSeleccionada}
          onCategoriaChange={handleCategoriaChange}
          onOcupacionChange={handleOcupacionChange}
          onClearFilters={clearFilters}
        />
        <div className="room-grid">
          {loading ? (
            <div className="loading-container">
              <p className="loading-message"> Cargando habitaciones...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>Error al cargar habitaciones</h3>
              <p>{error}</p>
              <button 
                className="btn-retry" 
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          ) : tiposFiltrados.length > 0 ? (
            tiposFiltrados.map((tipo) => (
              <RoomCard 
                key={tipo.id} 
                habitacion={adaptarDatosParaCard(tipo)} 
              />
            ))
          ) : (
            <div className="no-results">
              <h3>No se encontraron habitaciones</h3>
              <p>
                {filtroCategoriaSeleccionada === "Todas" && filtroOcupacionSeleccionada === "Todas" 
                  ? 'No hay habitaciones disponibles en este momento.' 
                  : 'Intenta ajustar los filtros para ver más opciones.'}
              </p>
              {(filtroCategoriaSeleccionada !== "Todas" || filtroOcupacionSeleccionada !== "Todas") && (
                <button className="btn-clear-filters-inline" onClick={clearFilters}>
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}