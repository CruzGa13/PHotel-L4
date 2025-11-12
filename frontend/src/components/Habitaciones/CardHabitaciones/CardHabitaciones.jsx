import './CardHabitaciones.css'
import imgHabitacionActiva from '../../../assets/Habitaciones/card_habitacion_activa.png'
import imgHabitacionInactiva from '../../../assets/Habitaciones/card_habitacion_inactiva.png'
import imgHabitacionTotal from '../../../assets/Habitaciones/card_habitacion_total.png'

export default function CardHabitaciones({ totals, loading = false }) {
  const {
    total_habitaciones = 0,
    habitaciones_activas = 0,
    habitaciones_inactivas = 0,
  } = totals || {}

  const displayValue = (value) => {
    if (loading) return '...';
    return value;
  };

  return (
    <section className="cards">
      {/* Card para Total de Habitaciones */}
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#f0ff4fff',
          '--grad-end': '#bf5900ff',
        }}
      >
        <div className="card-content">
          <p>Total Habitaciones</p>
          <h3 className="value">{displayValue(total_habitaciones)}</h3>
        </div>
        <img
          src={imgHabitacionTotal}
          alt="Total Habitaciones"
          className="card-image"
        />
      </div>

      {/* Card para Habitaciones Activas */}
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#90dcffff',
          '--grad-end': '#0066ffff',
          animationDelay: '.05s',
        }}
      >
        <div className="card-content">
          <p>Habitaciones Activas</p>
          <h3 className="value">{displayValue(habitaciones_activas)}</h3>
        </div>
        <img
          src={imgHabitacionActiva}
          alt="Habitaciones Activas"
          className="card-image"
        />
      </div>

      {/* Card para Habitaciones Inactivas */}
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#ad89ffff',
          '--grad-end': '#3d2084ff',
          animationDelay: '.1s',
        }}
      >
        <div className="card-content">
          <p>Habitaciones Inactivas</p>
          <h3 className="value">{displayValue(habitaciones_inactivas)}</h3>
        </div>
        <img
          src={imgHabitacionInactiva}
          alt="Habitaciones Inactivas"
          className="card-image"
        />
      </div>
    </section>
  )
}