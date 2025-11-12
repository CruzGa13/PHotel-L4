// ===============================================
// 📝 EJEMPLO DE CÓDIGO: Botones de Cambio de Estado
// Archivo: DetalleReserva.jsx
// ===============================================

// 1️⃣ IMPORTS NECESARIOS
import axios from "axios";
import { toast } from "react-toastify";

// 2️⃣ FUNCIÓN GENÉRICA PARA CAMBIAR ESTADO
const handleCambiarEstado = async (nuevoEstado, mensajeAccion) => {
  if (loading) return;

  try {
    setLoading(true);

    // Llamada PATCH al backend
    const response = await axios.patch(
      `${API_URL}/api/reservas/${reserva.id}/estado`,
      { estado: nuevoEstado },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      // Actualizar estado local
      const updatedReserva = {
        ...reserva,
        estado: nuevoEstado,
        historial: [
          ...(reserva.historial || []),
          {
            accion: mensajeAccion,
            usuario: "Administrador",
            fecha: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      };

      onUpdate(updatedReserva);
      
      // Refrescar lista de reservas
      if (refetchReservas) {
        refetchReservas();
      }

      // Mostrar toast de éxito
      toast.success(`✅ Reserva actualizada a ${nuevoEstado}`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
      }, 500);
    }
  } catch (error) {
    console.error(`Error al cambiar estado a ${nuevoEstado}:`, error);
    toast.error(
      `❌ Error al actualizar reserva: ${error.response?.data?.message || error.message}`,
      {
        position: "top-right",
        autoClose: 4000,
      }
    );
  } finally {
    setLoading(false);
  }
};

// 3️⃣ HANDLERS ESPECÍFICOS PARA CADA TRANSICIÓN
const handleConfirmar = () => {
  handleCambiarEstado("Confirmada", "Reserva confirmada por administrador");
};

const handleCheckIn = () => {
  handleCambiarEstado("CheckIn", "Check-In realizado");
};

const handleCheckOut = () => {
  handleCambiarEstado("CheckOut", "Check-Out realizado");
};

const handleCancelar = () => {
  setShowCancel(true); // Abre modal de confirmación
};

// 4️⃣ JSX: RENDERIZADO CONDICIONAL DE BOTONES
return (
  <div className="detalle-content">
    {/* ... otros campos de la reserva ... */}
    
    <p>
      <strong>Estado:</strong>{" "}
      <span
        className={`estado-tag ${
          reserva.estado === "Confirmada" || reserva.estado === "CheckIn"
            ? "estado-verde"
            : reserva.estado === "Cancelada"
            ? "estado-rojo"
            : "estado-amarillo"
        }`}
      >
        {reserva.estado}
      </span>
    </p>
    
    {/* 🔘 BOTONES CONDICIONALES SEGÚN ESTADO */}
    <div className="estado-actions">
      {/* Estado: Pendiente → Botones Confirmar y Cancelar */}
      {reserva.estado === "Pendiente" && (
        <>
          <button
            className="btn-confirmar"
            onClick={handleConfirmar}
            disabled={loading}
          >
            {loading ? "Procesando..." : "✅ Confirmar"}
          </button>
          <button
            className="btn-cancelar"
            onClick={handleCancelar}
            disabled={loading}
          >
            ❌ Cancelar
          </button>
        </>
      )}

      {/* Estado: Confirmada → Botones Check-In y Cancelar */}
      {reserva.estado === "Confirmada" && (
        <>
          <button
            className="btn-checkin"
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? "Procesando..." : "🚪 Check-In"}
          </button>
          <button
            className="btn-cancelar"
            onClick={handleCancelar}
            disabled={loading}
          >
            ❌ Cancelar
          </button>
        </>
      )}

      {/* Estado: CheckIn → Solo botón Check-Out */}
      {reserva.estado === "CheckIn" && (
        <button
          className="btn-checkout"
          onClick={handleCheckOut}
          disabled={loading}
        >
          {loading ? "Procesando..." : "🏁 Check-Out"}
        </button>
      )}

      {/* Estados finales: CheckOut o Cancelada → Mensaje informativo */}
      {(reserva.estado === "CheckOut" || reserva.estado === "Cancelada") && (
        <p className="estado-final-msg">
          ℹ️ Esta reserva está en estado final. No se pueden realizar más cambios.
        </p>
      )}
    </div>

    {/* ... historial de movimientos ... */}
  </div>
);

// ===============================================
// 📝 ESTILOS CSS NECESARIOS (DetalleReserva.css)
// ===============================================

/*
.estado-amarillo {
  border: 2px solid #d97706;
  color: #d97706;
  background: rgba(217, 119, 6, 0.08);
}

.estado-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.estado-actions button {
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.estado-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-confirmar {
  background-color: #16a34a;
  color: #fff;
}

.btn-confirmar:hover:not(:disabled) {
  background-color: #15803d;
  transform: scale(1.03);
}

.btn-cancelar {
  background-color: #dc2626;
  color: #fff;
}

.btn-cancelar:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: scale(1.03);
}

.btn-checkin {
  background-color: #2563eb;
  color: #fff;
}

.btn-checkin:hover:not(:disabled) {
  background-color: #1d4ed8;
  transform: scale(1.03);
}

.btn-checkout {
  background-color: #7c3aed;
  color: #fff;
}

.btn-checkout:hover:not(:disabled) {
  background-color: #6d28d9;
  transform: scale(1.03);
}

.estado-final-msg {
  margin: 0;
  padding: 12px;
  background: #f3f4f6;
  border-left: 4px solid #6b7280;
  border-radius: 8px;
  color: #4b5563;
  font-size: 14px;
}
*/

// ===============================================
// 📝 CONFIGURACIÓN EN APP.JSX
// ===============================================

/*
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppLayout() {
  return (
    <>
      // ... otros componentes ...
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      // ... resto del layout ...
    </>
  );
}
*/

// ===============================================
// 📝 ACTUALIZACIÓN EN RESERVAOP.JSX
// ===============================================

/*
// Pasar la función refetchReservas al componente DetalleReserva
{reservaDetalle && (
  <DetalleReserva
    reserva={reservaDetalle}
    onClose={() => setReservaDetalle(null)}
    onUpdate={handleUpdateReserva}
    refetchReservas={loadReservas}  // ← NUEVA PROP
  />
)}
*/
