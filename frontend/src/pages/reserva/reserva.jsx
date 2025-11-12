import React, { useState, useEffect } from "react";
import { ReservaCard } from "../../components/ReservaCard/ReservaCard";
import { FilterSection } from "../../components/FilterSection/FilterSection";
import "./reserva.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ReservaPage() {
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
        // ✅ Usando /tipos-habitacion/reservas que devuelve TODAS las imágenes
        const [tiposRes, categoriasRes, ocupacionesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tipos-habitacion/reservas`),
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
  }, []);

  // Lógica de filtrado
  const tiposFiltrados = tiposHabitacion.filter(tipo => {
    const matchCategoria = filtroCategoriaSeleccionada === "Todas" || 
                          tipo.categoria?.nombre === filtroCategoriaSeleccionada;
    
    const matchOcupacion = filtroOcupacionSeleccionada === "Todas" || 
                          tipo.ocupacion?.nombre === filtroOcupacionSeleccionada;
    
    return matchCategoria && matchOcupacion;
  });

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

  // Adaptador: Convierte los datos del backend al formato que espera ReservaCard
  const adaptarDatosParaCard = (tipo) => {
    // Extraer TODAS las URLs de imágenes
    const todasLasImagenes = tipo.imagenes?.map(img => img.url) || [];
    
    return {
      _id: tipo.id,
      name: tipo.nombre || 'Sin nombre',
      images: todasLasImagenes.length > 0 ? todasLasImagenes : ['/placeholder-room.jpg'], // ✅ Array completo
      huespedes: tipo.ocupacion?.capacidad || 0,
      price: tipo.tarifaBase || 0,
      category: tipo.categoria?.nombre || 'Sin categoría',
      spaceType: tipo.ocupacion?.nombre || 'Sin tipo'
    };
  };

  return (
    <div className="reserva-page">
      <main className="reserva-container">
        <header className="page-header pt-10">
          <h2 className="page-title">Reserva tu Habitación</h2>
          <p className="page-subtitle">Selecciona la habitación perfecta para tu estancia</p>
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

        <div className="reserva-grid">
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
              <h3>⚠️ No hay habitaciones disponibles</h3>
              <p>Por favor, contacta al administrador para más información.</p>
            </div>
          ) : tiposFiltrados.length > 0 ? (
            tiposFiltrados.map((tipo) => (
              <ReservaCard 
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
