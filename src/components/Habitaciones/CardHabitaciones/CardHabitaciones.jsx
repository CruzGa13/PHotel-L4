import './CardHabitaciones.css'
import imgHabitacionActiva from '/src/assets/habitaciones/card_habitacion_activa.png'
import imgHabitacionInactiva from '/src/assets/habitaciones/card_habitacion_inactiva.png'
import imgHabitacionTotal from '/src/assets/habitaciones/card_habitacion_total.png'

export default function CardHabitaciones({ totals }) {
  const {
    total_habitaciones = 4,
    habitaciones_activas = 1,
    habitaciones_inactivas = 3,
  } = totals || {}

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
          <h3 className="value">{total_habitaciones}</h3>
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
          <h3 className="value">{habitaciones_activas}</h3>
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
          <h3 className="value">{habitaciones_inactivas}</h3>
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