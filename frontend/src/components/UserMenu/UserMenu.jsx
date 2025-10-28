import React, { useState } from "react";
import { FaChevronDown, FaUser } from "react-icons/fa";
import AuthModal from "../auth/AuthModal";
import AvatarBadge from "../common/AvatarBadge";
import { useAuth } from "../../context/AuthContext";
import "./UserMenu.css";

const UserMenu = () => {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Mostrar nada mientras carga
  if (loading) {
    return (
      <div className="user-menu">
        <div className="text-sm text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Si NO hay sesión, mostrar botón de inicio de sesión
  if (!user) {
    return (
      <>
        <div className="user-menu">
          <button
            className="login-button"
            onClick={() => setAuthModalOpen(true)}
          >
            <FaUser className="login-icon" aria-hidden />
            <span>Iniciar sesión</span>
          </button>

        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </>
    );
  }

  // Si SÍ hay sesión, mostrar tarjeta de usuario
  const nombreCompleto = user.nombre && user.apellido 
    ? `${user.nombre} ${user.apellido}` 
    : user.nombre || user.email;
  const rolNombre = user.rol?.nombre || 'Cliente';

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <div className="user-menu">
      <div className="user-card" onClick={() => setOpen(!open)}>
        <AvatarBadge user={user} size={40} />
        <div className="user-lines">
          <div className="user-name">{nombreCompleto}</div>
          <div className="user-role">{rolNombre}</div>
        </div>
        <FaChevronDown className={`chevron ${open ? "open" : ""}`} />
      </div>

      {open && (
        <div className="user-dropdown">
          <div className="user-header">
            <AvatarBadge user={user} size={40} />
            <div>
              <p className="user-name">{nombreCompleto}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <hr />
          <button>Mi cuenta</button>
          <button>Mis reservas</button>
          <button>Notificaciones</button>
          <hr />
          <button className="logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
