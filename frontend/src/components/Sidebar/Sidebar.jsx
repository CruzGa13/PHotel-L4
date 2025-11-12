import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaBed,
  FaConciergeBell,
  FaCalendarCheck,
  FaEnvelope,
  FaTimes,
  FaClipboardList,
  FaComments,
  FaCog,
  FaMap,
} from "react-icons/fa";
import UserMenu from "../UserMenu/UserMenu";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose, activeItem }) => {
  const { user } = useAuth();
  
  // Verificar si el usuario es operador (case-insensitive)
  const isOperador = user?.rol?.nombre?.toLowerCase() === "operador";
  
  const getMenuItemClass = (item) => {
    return `menu-item ${activeItem === item ? "active" : ""}`;
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      ></div>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo_hotel.png" alt="Logo" className="logo-icon" />
            <div className="logo-text">
              <h2>Ríos de Agua Viva</h2>
              <p>Hotel</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* --- Navegación --- */}
        <nav className="sidebar-nav">
          {/* Items para usuarios NO operadores (clientes) */}
          {!isOperador && (
            <>
              <Link to="/inicio" className={getMenuItemClass("inicio")}>
                <FaHome className="menu-item-icon" />
                <span className="menu-item-text">Inicio</span>
              </Link>
              <Link to="/habitaciones" className={getMenuItemClass("habitaciones")}>
                <FaBed className="menu-item-icon" />
                <span className="menu-item-text">Habitaciones</span>
              </Link>
              <Link to="/servicios" className={getMenuItemClass("servicios")}>
                <FaConciergeBell className="menu-item-icon" />
                <span className="menu-item-text">Servicios</span>
              </Link>
              <Link to="/reserva" className={getMenuItemClass("reserva")}>
                <FaCalendarCheck className="menu-item-icon" />
                <span className="menu-item-text">Reserva</span>
              </Link>
              <Link to="/contacto" className={getMenuItemClass("contacto")}>
                <FaEnvelope className="menu-item-icon" />
                <span className="menu-item-text">Contacto</span>
              </Link>
            </>
          )}

          {/* Items SOLO para operadores */}
          {isOperador && (
            <>
              <div className="menu-separator">
                <span>Panel de Operador</span>
              </div>

              <Link to="/habitaciones-op" className={getMenuItemClass("habitaciones-op")}>
                <FaCog className="menu-item-icon" />
                <span className="menu-item-text">Gestión De Habitaciones</span>
              </Link>
              <Link to="/mapa-habitaciones" className={getMenuItemClass("mapa-habitaciones")}>
                <FaMap className="menu-item-icon" />
                <span className="menu-item-text">Mapa de Habitaciones</span>
              </Link>
              <Link to="/reserva-op" className={getMenuItemClass("reserva-op")}>
                <FaClipboardList className="menu-item-icon" />
                <span className="menu-item-text">Gestión de Reservas</span>
              </Link>
              <Link to="/mensajes-op" className={getMenuItemClass("mensajes-op")}>
                <FaComments className="menu-item-icon" />
                <span className="menu-item-text">Mensajes</span>
              </Link>
            </>
          )}
        </nav>

        {/* --- Footer con menú del usuario --- */}
        <div className="sidebar-footer">
          <UserMenu />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
