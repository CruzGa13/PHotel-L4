import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaUser } from "react-icons/fa";
import AuthModal from "../auth/AuthModal";
import AvatarBadge from "../common/AvatarBadge";
import { useAuth } from "../../context/AuthContext";
import "./UserMenu.css";

// Modal Portal Component (inline)
const ModalPortal = ({ children }) => {
  return createPortal(children, document.body);
};

const UserMenu = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef(null);
  const modalRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Cerrar modal al hacer click fuera
  useEffect(() => {
    if (!confirmOpen) return;

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setConfirmOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [confirmOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (confirmOpen) {
          setConfirmOpen(false);
        } else if (open) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, confirmOpen]);

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

  const closeMenu = () => setOpen(false);

  const handleLogoutClick = () => {
    setOpen(false); // Cerrar dropdown primero
    setConfirmOpen(true); // Abrir modal
  };

  const handleLogoutConfirm = async () => {
    await signOut();
    setConfirmOpen(false);
    // Redirigir a inicio después de cerrar sesión
    navigate('/inicio');
  };

  const handleLogoutCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="user-menu" ref={menuRef}>
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
            <button onClick={closeMenu}>Mi cuenta</button>
            <button onClick={closeMenu}>Mis reservas</button>
            <button onClick={closeMenu}>Notificaciones</button>
            <hr />
            <button className="logout" onClick={handleLogoutClick}>Cerrar sesión</button>
          </div>
        )}
      </div>

      {/* Modal de confirmación usando Portal */}
      {confirmOpen && (
        <ModalPortal>
          <div className="umodal-backdrop">
            <div className="umodal" ref={modalRef}>
              <h3 className="umodal-title">¿Cerrar sesión?</h3>
              <p className="umodal-desc">
                Tendrás que iniciar sesión nuevamente para confirmar nuevas reservas.
              </p>
              <div className="umodal-actions">
                <button className="umodal-btn umodal-btn-secondary" onClick={handleLogoutCancel}>
                  Cancelar
                </button>
                <button className="umodal-btn umodal-btn-primary" onClick={handleLogoutConfirm}>
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};

export default UserMenu;
