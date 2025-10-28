import { useMemo, useState } from "react";
import CardMensaje from "../../components/Mensaje/CardMensaje/CardMensaje.jsx";
import FiltroMensajes from "../../components/Mensaje/FiltroMensajes/FiltroMensajes.jsx";
import TablaMensajes from "../../components/Mensaje/TablaMensajes/TablaMensajes.jsx";
import RespuestaMensaje from "../../components/Mensaje/RespuestaMensaje/RespuestaMensaje.jsx";
import DetalleMensajes from "../../components/Mensaje/DetalleMensajes/DetalleMensajes.jsx";
import "./MensajesOp.css";

const mensajesSeed = [
  {
    id: "msg_001",
    cliente: "Juan Pérez",
    email: "juan.perez@cliente.com",
    mensaje: "Hola, quisiera saber más sobre la habitación Suite Premium...",
    fecha: "2025-10-24",
    estado: "Sin Responder",
  },
  {
    id: "msg_002",
    cliente: "María Gómez",
    email: "maria.gomez@cliente.com",
    mensaje: "Gracias por la información, todo muy claro.",
    fecha: "2025-10-23",
    estado: "Contestado",
  },
  {
    id: "msg_003",
    cliente: "Carlos López",
    email: "carlos.lopez@cliente.com",
    mensaje: "¿Tienen disponibilidad para el próximo fin de semana?",
    fecha: "2025-10-24",
    estado: "Sin Responder",
  },
  {
    id: "msg_004",
    cliente: "Ana Torres",
    email: "ana.torres@cliente.com",
    mensaje: "El servicio fue excelente. ¡Volveremos!",
    fecha: "2025-10-22",
    estado: "Contestado",
  },
];

export default function MensajesOp() {
  const [rows, setRows] = useState(mensajesSeed);
  const [mensajeParaResponder, setMensajeParaResponder] = useState(null);
  const [mensajeDetalle, setMensajeDetalle] = useState(null);

  const totals = useMemo(() => {
    const totalMensajes = rows.length;
    const contestados = rows.filter((r) => r.estado === "Contestado").length;
    const sinResponder = rows.filter(
      (r) => r.estado === "Sin Responder"
    ).length;
    return { totalMensajes, contestados, sinResponder };
  }, [rows]);

  const handleOpenReplyModal = (mensaje) => {
    setMensajeParaResponder(mensaje);
  };

  const handleCloseReplyModal = () => {
    setMensajeParaResponder(null);
  };

  const handleSendReply = async (mensajeId, respuesta) => {
    console.log("Enviando respuesta al mensaje:", mensajeId, { respuesta });

    await new Promise((resolve) => setTimeout(resolve, 800));
    setRows((prev) =>
      prev.map((r) =>
        r.id === mensajeId
          ? {
              ...r,
              estado: "Contestado",
              respuesta,
              respondidoPor: "Cami (Admin)",
              fechaRespuesta: new Date().toLocaleDateString(),
              horaRespuesta: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : r
      )
    );
  };

  return (
    <div className="page">
      <main className="container-main">
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="sep">›</span>
          <span className="pink">Mensajes</span>
        </div>

        <div className="head-top">
          <div>
            <h2 className="gradient-text">Mensajes</h2>
            <p className="muted">
              Visualización general de los mensajes recibidos
            </p>
          </div>
        </div>

        <CardMensaje
          totals={{
            Total_mensaje: totals.totalMensajes,
            mensaje_resp: totals.contestados,
            mensaje_n_resp: totals.sinResponder,
          }}
        />

        <FiltroMensajes onClear={() => {}} onSearch={() => {}} />

        <TablaMensajes
          rows={rows}
          onView={(mensaje) => setMensajeDetalle(mensaje)}
          onReply={handleOpenReplyModal}
        />
      </main>

      {mensajeParaResponder && (
        <RespuestaMensaje
          mensaje={mensajeParaResponder}
          onClose={handleCloseReplyModal}
          onSend={handleSendReply}
        />
      )}

      {mensajeDetalle && (
        <DetalleMensajes
          mensaje={mensajeDetalle}
          onClose={() => setMensajeDetalle(null)}
        />
      )}
    </div>
  );
}
