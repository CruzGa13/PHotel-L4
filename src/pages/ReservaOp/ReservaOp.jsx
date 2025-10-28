import { useMemo, useState } from "react";
import Card from "../../components/Reserva/Card/Card.jsx";
import FiltroReserva from "../../components/Reserva/FiltroReserva/FiltroReserva.jsx";
import TablaReserva from "../../components/Reserva/TablaReserva/TablaReserva.jsx";
import DetalleReserva from "../../components/Reserva/DetalleReserva/DetalleReserva.jsx";
import "./ReservaOp.css";

const reservasSeed = [
  {
    id: 1,
    numeroHabitacion: "101",
    huesped: "Juan Pérez",
    nombreHabitacion: "Suite Premium",
    checkIn: "2025-10-25",
    checkOut: "2025-10-28",
    categoria: "Suite",
    tipoEspacio: "Doble",
    estado: "Confirmada",
    total: "$250.000",
    observacion: "Solicitó servicio de desayuno en habitación.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Administrador",
        fecha: "2025-10-15",
        hora: "10:34",
      },
      {
        accion: "Confirmación",
        usuario: "Recepción",
        fecha: "2025-10-16",
        hora: "11:10",
      },
    ],
  },
  {
    id: 2,
    numeroHabitacion: "202",
    huesped: "María Gómez",
    nombreHabitacion: "Habitación Deluxe",
    checkIn: "2025-10-26",
    checkOut: "2025-10-29",
    categoria: "Deluxe",
    tipoEspacio: "Triple",
    estado: "Cancelada",
    total: "$0",
    observacion: "Canceló por motivos personales.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Recepción",
        fecha: "2025-10-14",
        hora: "09:48",
      },
      {
        accion: "Cancelación",
        usuario: "María Gómez",
        fecha: "2025-10-20",
        hora: "16:25",
      },
    ],
  },
  {
    id: 3,
    numeroHabitacion: "303",
    huesped: "Carlos López",
    nombreHabitacion: "Habitación Estándar",
    checkIn: "2025-10-27",
    checkOut: "2025-10-30",
    categoria: "Estándar",
    tipoEspacio: "Individual",
    estado: "Confirmada",
    total: "$120.000",
    observacion: "Prefiere piso alto.",
    historial: [
      {
        accion: "Creación de reserva",
        usuario: "Recepción",
        fecha: "2025-10-18",
        hora: "13:12",
      },
    ],
  },
];

export default function ReservaOp() {
  const [rows, setRows] = useState(reservasSeed);
  const [reservaDetalle, setReservaDetalle] = useState(null);

  // Totales dinámicos
  const totals = useMemo(() => {
    const total = rows.length;
    const confirmadas = rows.filter((r) => r.estado === "Confirmada").length;
    const canceladas = rows.filter((r) => r.estado === "Cancelada").length;
    return { total, confirmadas, canceladas };
  }, [rows]);

  // 🔁 Actualiza estado en tiempo real cuando el admin cancela una reserva
  const handleUpdateReserva = (updatedReserva) => {
    setRows((prev) =>
      prev.map((r) => (r.id === updatedReserva.id ? updatedReserva : r))
    );
    setReservaDetalle(updatedReserva);
  };

  return (
    <div className="page">
      <main className="container-main fade-in">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="sep">›</span>
          <span className="pink">Reservas</span>
        </div>

        {/* Cabecera */}
        <div className="head-top">
          <div>
            <h2 className="gradient-text">Reservas</h2>
            <p className="muted">
              Visualización general de reservas confirmadas y canceladas
            </p>
          </div>
        </div>

        {/* Tarjeta resumen */}
        <Card
          totals={{
            total: totals.total,
            ingresos: totals.confirmadas,
            egresos: totals.canceladas,
          }}
        />

        {/* Filtros */}
        <FiltroReserva onClear={() => {}} onSearch={() => {}} />

        {/* Tabla principal */}
        <TablaReserva rows={rows} onView={(r) => setReservaDetalle(r)} />

        {/* Modal Detalle de Reserva */}
        {reservaDetalle && (
          <DetalleReserva
            reserva={reservaDetalle}
            onClose={() => setReservaDetalle(null)}
            onUpdate={handleUpdateReserva}
          />
        )}
      </main>
    </div>
  );
}
