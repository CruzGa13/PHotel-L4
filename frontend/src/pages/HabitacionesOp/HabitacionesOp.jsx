// src/pages/HabitacionesOp/HabitacionesOp.jsx

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listHabitaciones, getCategorias, getTiposHabitacion, getHabitacionesKpis } from "../../services/habitaciones.api";

import CardHabitaciones from "../../components/Habitaciones/CardHabitaciones/CardHabitaciones.jsx";
import FiltroHabitaciones from "../../components/Habitaciones/FiltroHabitaciones/FiltroHabitaciones.jsx";
import TablaHabitaciones from "../../components/Habitaciones/TablaHabitaciones/TablaHabitaciones.jsx";
import RegistrarHabitacion from "../../components/Habitaciones/RegistrarHabitacion/RegistrarHabitacion.jsx";

import "./HabitacionesOp.css";

export default function HabitacionesOp() {
  const navigate = useNavigate();

  // Estado para habitaciones
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para paginación
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Estado para ordenamiento
  const [orderBy, setOrderBy] = useState('numero');
  const [dir, setDir] = useState('asc');

  // Estado para filtros (valores aplicados)
  const [appliedFilters, setAppliedFilters] = useState({
    q: '',
    categoriaId: '',
    tipoHabitacionId: '',
    capacidad: '',
  });

  // Estado para valores del formulario (temporales)
  const [filterValues, setFilterValues] = useState({
    q: '',
    categoriaId: '',
    tipoHabitacionId: '',
    capacidad: '',
  });

  // Estado para catálogos
  const [categorias, setCategorias] = useState([]);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);

  // Estado para KPIs
  const [kpis, setKpis] = useState({
    total: 0,
    activas: 0,
    inactivas: 0,
  });
  const [kpisLoading, setKpisLoading] = useState(true);
  const [incluirBloqueosVigentes, setIncluirBloqueosVigentes] = useState(false);

  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar catálogos al montar
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [categoriasData, tiposData] = await Promise.all([
          getCategorias(),
          getTiposHabitacion(),
        ]);
        setCategorias(categoriasData);
        setTiposHabitacion(tiposData);
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
        toast.error('Error al cargar catálogos', { position: 'top-center' });
      }
    };
    fetchCatalogos();
  }, []);

  // Cargar KPIs
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setKpisLoading(true);
        const data = await getHabitacionesKpis({ incluirBloqueosVigentes });
        setKpis({
          total: data.total,
          activas: data.activas,
          inactivas: data.inactivas,
        });
      } catch (err) {
        console.error('Error al cargar KPIs:', err);
        toast.error('Error al cargar KPIs', { position: 'top-center' });
      } finally {
        setKpisLoading(false);
      }
    };
    fetchKpis();
  }, [incluirBloqueosVigentes]);

  // Cargar habitaciones desde la API
  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construir parámetros con filtros aplicados
        const params = { page, pageSize, orderBy, dir };
        if (appliedFilters.q) params.q = appliedFilters.q;
        if (appliedFilters.categoriaId) params.categoriaId = appliedFilters.categoriaId;
        if (appliedFilters.tipoHabitacionId) params.tipoHabitacionId = appliedFilters.tipoHabitacionId;
        if (appliedFilters.capacidad) params.capacidad = appliedFilters.capacidad;
        
        const data = await listHabitaciones(params);
        setRows(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error('Error al cargar habitaciones:', err);
        setError(err.message || 'No se pudieron cargar las habitaciones');
        toast.error(err.message || 'Error al cargar habitaciones', { position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };

    fetchHabitaciones();
  }, [page, pageSize, orderBy, dir, appliedFilters]);

  const totals = useMemo(() => {
    return {
      total_habitaciones: kpis.total,
      habitaciones_activas: kpis.activas,
      habitaciones_inactivas: kpis.inactivas,
    };
  }, [kpis]);

  const handleViewDetalle = (habitacion) => {
    navigate(`/habitaciones-op/${habitacion.id}`);
  };

  // Funciones de paginación
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Función de ordenamiento
  const handleSort = (column) => {
    if (orderBy === column) {
      // Si es la misma columna, cambiar dirección
      setDir(dir === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es nueva columna, ordenar ascendente
      setOrderBy(column);
      setDir('asc');
    }
    // Resetear a la primera página al ordenar
    setPage(1);
  };

  // Funciones de filtros
  const handleFilterChange = (field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    // Aplicar los filtros temporales
    setAppliedFilters(filterValues);
    // Resetear a la primera página al aplicar filtros
    setPage(1);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      q: '',
      categoriaId: '',
      tipoHabitacionId: '',
      capacidad: '',
    };
    setFilterValues(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  // --- 3. AÑADE LA FUNCIÓN PARA GUARDAR LA NUEVA HABITACIÓN ---
  const handleAddHabitacion = (nuevaHabitacion) => {
    // Añadimos la nueva habitación al principio de la lista
    setRows([nuevaHabitacion, ...rows]);
    // No cerramos el modal aquí, el modal lo hará con su prop 'onClose'
  };

  return (
    <div className="page habitaciones-op-page">
      <main className="container-main fade-in">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="sep">›</span>
          <span>Operador</span>
          <span className="sep">›</span>
          <span className="pink">Gestión de Habitaciones</span>
        </div>

        {/* Cabecera */}
        <div className="head-top pt-10">
          <div>
            <h2 className="gradient-text">Habitaciones</h2>
            <p className="muted">
              Gestión de habitaciones, categorías y tipos de espacio
            </p>
          </div>
          
          {/* --- BOTÓN DE REGISTRAR HABITACIÓN (COMENTADO) --- */}
          {/* <div>
            <button 
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Registrar Habitación
            </button>
          </div> */}

        </div>

        <CardHabitaciones totals={totals} loading={kpisLoading} />
        
        {/* Switch opcional para incluir bloqueos vigentes */}
        <div className="glass" style={{ padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="incluir-bloqueos" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="incluir-bloqueos"
              type="checkbox"
              checked={incluirBloqueosVigentes}
              onChange={(e) => setIncluirBloqueosVigentes(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Incluir habitaciones con bloqueos vigentes en inactivas
            </span>
          </label>
        </div>

        <FiltroHabitaciones 
          filters={filterValues}
          categorias={categorias}
          tiposHabitacion={tiposHabitacion}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          disabled={loading}
        />
        <TablaHabitaciones 
          rows={rows} 
          loading={loading}
          error={error}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          orderBy={orderBy}
          dir={dir}
          onView={handleViewDetalle}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
          onSort={handleSort}
        />

        {/* --- 5. RENDERIZA EL MODAL CONDICIONALMENTE --- */}
        {isModalOpen && (
          <RegistrarHabitacion 
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddHabitacion}
          />
        )}

      </main>
    </div>
  );
}