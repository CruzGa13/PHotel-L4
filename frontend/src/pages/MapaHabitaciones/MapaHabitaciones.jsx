import MapaTimeline from "../../components/MapaHabitacionesTimeline/MapaTimeline";
import "./MapaHabitaciones.css";

export default function MapaHabitaciones() {

  return (
    <div className="page">
      <main className="container-main fade-in">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="sep">›</span>
          <span>Operador</span>
          <span className="sep">›</span>
          <span className="pink">Mapa de Habitaciones</span>
        </div>

        {/* Cabecera */}
        <div className="head-top pt-10">
          <div>
            <h2 className="mapa-titulo">Mapa de Habitaciones</h2>
            <p className="muted">
              Visualización del estado y distribución de todas las habitaciones del hotel
            </p>
          </div>
        </div>

        {/* Componente de Timeline */}
        <MapaTimeline />
      </main>
    </div>
  );
}
