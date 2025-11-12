import React, { useState, useEffect } from "react";
import { RoomCard } from "../../components/RoomCard/RoomCard";
import { FilterSection } from "../../components/FilterSection/FilterSection";
import "./habitaciones.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

        // Validar y transformar datos
        const tiposValidos = Array.isArray(tiposData) ? tiposData : [];
        const categoriasValidas = Array.isArray(categoriasData) ? categoriasData : [];
        const ocupacionesValidas = Array.isArray(ocupacionesData) ? ocupacionesData : [];

        // Transformar categorías de objetos a array de strings
        const categoriasNombres = categoriasValidas
          .filter(cat => cat && cat.nombre)
          .map(cat => cat.nombre);

        // Actualizar estados
        setTiposHabitacion(tiposValidos);
        setCategoriasFiltro(categoriasNombres);
        setOcupacionesFiltro(ocupacionesValidas);

        console.log('✅ Datos cargados exitosamente:', {
          tipos: tiposValidos.length,
          categorias: categoriasNombres,
          ocupaciones: ocupacionesValidas
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
                          tipo.categoria?.nombre === filtroCategoriaSeleccionada;
    
    const matchOcupacion = filtroOcupacionSeleccionada === "Todas" || 
                          tipo.ocupacion?.nombre === filtroOcupacionSeleccionada;
    
    return matchCategoria && matchOcupacion;
  });

  // Log para depuración de filtros
  useEffect(() => {
    console.log('🔍 Filtros aplicados:', {
      categoria: filtroCategoriaSeleccionada,
      ocupacion: filtroOcupacionSeleccionada,
      resultados: tiposFiltrados.length
    });
  }, [filtroCategoriaSeleccionada, filtroOcupacionSeleccionada, tiposFiltrados.length]);

  // Handlers para filtros
  const handleCategoriaChange = (e) => {
    const newValue = e.target.value;
    console.log('🏷️ Cambio de categoría:', newValue);
    setFiltroCategoriaSeleccionada(newValue);
  };

  const handleOcupacionChange = (e) => {
    const newValue = e.target.value;
    console.log('👥 Cambio de ocupación:', newValue);
    setFiltroOcupacionSeleccionada(newValue);
  };

  const clearFilters = () => {
    console.log('🧹 Limpiando filtros');
    setFiltroCategoriaSeleccionada("Todas");
    setFiltroOcupacionSeleccionada("Todas");
  };

  // Adaptador: Convierte los datos del backend al formato que espera RoomCard
  const adaptarDatosParaCard = (tipo) => {
    return {
      _id: tipo.id,
      name: tipo.nombre || 'Sin nombre',
      description: tipo.descripcion || 'Sin descripción',
      image1: tipo.imagenes?.[0]?.url || '/placeholder-room.jpg',
      image2: tipo.imagenes?.[1]?.url || tipo.imagenes?.[0]?.url || '/placeholder-room.jpg',
      huespedes: tipo.ocupacion?.capacidad || 0,
      price: tipo.tarifaBase || 0,
      category: tipo.categoria?.nombre || 'Sin categoría',
      spaceType: tipo.ocupacion?.nombre || 'Sin tipo'
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
              <p className="loading-message">⏳ Cargando habitaciones...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>❌ Error al cargar habitaciones</h3>
              <p>{error}</p>
              <button 
                className="btn-retry" 
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          ) : tiposHabitacion.length === 0 ? (
            <div className="no-results">
              <h3>⚠️ No hay habitaciones en la base de datos</h3>
              <p>Por favor, contacta al administrador para cargar habitaciones.</p>
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
              <h3>🔍 No se encontraron habitaciones</h3>
              <p>
                {filtroCategoriaSeleccionada === "Todas" && filtroOcupacionSeleccionada === "Todas" 
                  ? 'No hay habitaciones disponibles con los criterios seleccionados.' 
                  : `No hay habitaciones de categoría "${filtroCategoriaSeleccionada}" y tipo "${filtroOcupacionSeleccionada}".`}
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