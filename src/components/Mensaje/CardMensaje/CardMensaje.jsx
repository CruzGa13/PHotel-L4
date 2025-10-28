import './CardMensaje.css'
import imgTotalMensaje from '/src/assets/mensaje/total_mensajes.png'
import imgSinRespMensaje from '/src/assets/mensaje/mensaje_sin_responder.png'
import imgRespMensaje from '/src/assets/mensaje/mensajes_contestados.png'

export default function CardMensaje({ totals }) {
  const {
    Total_mensaje = 4,
    mensaje_resp = 1,
    mensaje_n_resp = 3,
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
          <p>Total Mensajes</p>
          <h3 className="value">{Total_mensaje}</h3>
        </div>
        <img
          src={imgTotalMensaje}
          alt="Total Mensajes"
          className="card-image"
        />
      </div>
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#90dcffff',
          '--grad-end': '#0066ffff',
          animationDelay: '.05s',
        }}
      >
        <div className="card-content">
          <p>Mensajes Contestados</p>
          <h3 className="value">{mensaje_resp}</h3>
        </div>
        <img
          src={imgRespMensaje}
          alt="Mensajes Contestados"
          className="card-image"
        />
      </div>
      <div
        className="card fade-in"
        style={{
          '--grad-start': '#ad89ffff',
          '--grad-end': '#3d2084ff',
          animationDelay: '.1s',
        }}
      >
        <div className="card-content">
          <p>Mensajes Sin Responder</p>
          <h3 className="value">{mensaje_n_resp}</h3>
        </div>
        <img
          src={imgSinRespMensaje}
          alt="Mensajes Sin Responder"
          className="card-image"
        />
      </div>
    </section>
  )
}