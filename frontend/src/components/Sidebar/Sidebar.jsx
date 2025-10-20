import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaBed,
  FaConciergeBell,
  FaCalendarCheck,
  FaEnvelope,
  FaTimes,
} from "react-icons/fa";
import UserMenu from "../UserMenu/UserMenu";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose, activeItem }) => {
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
