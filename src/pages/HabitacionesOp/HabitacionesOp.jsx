// src/pages/HabitacionesOp/HabitacionesOp.jsx

import { useMemo, useState } from "react"; // <-- 'useState' ya está importado
import { useNavigate } from "react-router-dom";

import CardHabitaciones from "../../components/Habitaciones/CardHabitaciones/CardHabitaciones.jsx";
import FiltroHabitaciones from "../../components/Habitaciones/FiltroHabitaciones/FiltroHabitaciones.jsx";
import TablaHabitaciones from "../../components/Habitaciones/TablaHabitaciones/TablaHabitaciones.jsx";
import RegistrarHabitacion from "../../components/Habitaciones/RegistrarHabitacion/RegistrarHabitacion.jsx";

import "./HabitacionesOp.css";

const habitacionesSeed = [
  // ... (tus datos de habitaciones)
  {
    id: 1,
    nro_habitacion: "101",
    nombre: "Suite Océano",
    categoria: "Suite",
    tipo_espacio: "Doble",
    cantidad_huespedes: 2,
    fecha_registro: "2025-01-15 10:30",
    estado: "Activa", 
    observacion: "Vista al mar, cama King.",
    historial: [ /* ... */ ],
  },
  // ... más habitaciones
];


export default function HabitacionesOp() {
  const [rows, setRows] = useState(habitacionesSeed);
  const navigate = useNavigate();

  // --- 2. AÑADE ESTADO PARA VISIBILIDAD DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totals = useMemo(() => {
    const total = rows.length;
    const activas = rows.filter((r) => r.estado === "Activa").length;
    const inactivas = rows.filter((r) => r.estado === "Inactiva").length;

    return {
      total_habitaciones: total,
      habitaciones_activas: activas,
      habitaciones_inactivas: inactivas,
    };
  }, [rows]);

  const handleViewDetalle = (habitacion) => {
    navigate(`/habitaciones/${habitacion.id}`, { state: { habitacion } });
  };

  // --- 3. AÑADE LA FUNCIÓN PARA GUARDAR LA NUEVA HABITACIÓN ---
  const handleAddHabitacion = (nuevaHabitacion) => {
    // Añadimos la nueva habitación al principio de la lista
    setRows([nuevaHabitacion, ...rows]);
    // No cerramos el modal aquí, el modal lo hará con su prop 'onClose'
  };

  return (
    <div className="page">
      <main className="container-main fade-in">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="sep">›</span>
          <span className="pink">Habitaciones</span>
        </div>

        {/* Cabecera */}
        <div className="head-top">
          <div>
            <h2 className="gradient-text">Habitaciones</h2>
            <p className="muted">
              Gestión de habitaciones, categorías y tipos de espacio
            </p>
          </div>
          
          {/* --- 4. AÑADE EL BOTÓN PARA ABRIR EL MODAL --- */}
          <div>
            <button 
              className="btn btn-primary" // O 'btn-blue' según tu CSS
              onClick={() => setIsModalOpen(true)}
            >
              Registrar Habitación
            </button>
          </div>

        </div>

        <CardHabitaciones totals={totals} />
        <FiltroHabitaciones onClear={() => {}} onSearch={() => {}} />
        <TablaHabitaciones rows={rows} onView={handleViewDetalle} />

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