import './Card.css'
import imgReservas from '/src/assets/reserva/card_total_reserva.png'
import imgCheckIn from '/src/assets/reserva/card_check_in.png'
import imgCheckOut from '/src/assets/reserva/card_check_out.png'
import imgTotal from '/src/assets/reserva/card_total.png'

export default function Card({ totals }) {
  const {
    totalReservas = 32,
    checkIn = 18,
    checkOut = 14,
    total = '$460.000',
  } = totals || {}

  return (
    <section className="cards">
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#f0ff4fff',
          '--grad-end': '#bf5900ff',
        }}
      >
        <div className="card-content">
          <p>Total Reservas</p>
          <h3 className="value">{totalReservas}</h3>
        </div>
        <img
          src={imgReservas}
          alt="Total Reservas"
          className="card-image"
        />
      </div>
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#48f0b3ff',
          '--grad-end': '#007950ff',
          animationDelay: '.05s',
        }}
      >
        <div className="card-content">
          <p>Check In</p>
          <h3 className="value">{checkIn}</h3>
        </div>
        <img
          src={imgCheckIn}
          alt="Check In"
          className="card-image"
        />
      </div>
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#ff9898ff',
          '--grad-end': '#EF4444',
          animationDelay: '.1s',
        }}
      >
        <div className="card-content">
          <p>Check Out</p>
          <h3 className="value">{checkOut}</h3>
        </div>
        <img
          src={imgCheckOut} 
          alt="Check Out"
          className="card-image"
        />
      </div>
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#3B82F6',
          '--grad-end': '#60A5FA',
          animationDelay: '.15s',
        }}
      >
        <div className="card-content">
          <p>Total</p>
          <h3 className="value">{total}</h3>
        </div>
        <img
          src={imgTotal} 
          alt="Total"
          className="card-image"
        />
      </div>
    </section>
  )
}