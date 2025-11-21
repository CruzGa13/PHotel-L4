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
  FaUsers,
  FaDoorOpen,
  FaChartBar,
} from "react-icons/fa";
import UserMenu from "../UserMenu/UserMenu";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose, activeItem }) => {
  const { user } = useAuth();
  
  // Verificar roles (case-insensitive)
  const rolNombre = user?.rol?.nombre?.toLowerCase();
  const isOperador = rolNombre === "operador";
  const isAdministrador = rolNombre === "administrador";
  
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
          {/* Items para CLIENTES (no operadores ni administradores) */}
          {!isOperador && !isAdministrador && (
            <>
              <Link to="/inicio" className={getMenuItemClass("inicio")}>
                <FaHome className="menu-item-icon" />
                <span className="menu-item-text">Inicio</span>
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

          {/* Items SOLO para OPERADORES */}
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

          {/* Items SOLO para ADMINISTRADORES */}
          {isAdministrador && (
            <>
              <div className="menu-separator">
                <span>Panel de Administrador</span>
              </div>

              <Link to="/admin/consultas-graficos" className={getMenuItemClass("admin-consultas")}>
                <FaChartBar className="menu-item-icon" />
                <span className="menu-item-text">Consultas y Gráficos</span>
              </Link>
              <Link to="/crud-habitaciones" className={getMenuItemClass("crud-habitaciones")}>
                <FaDoorOpen className="menu-item-icon" />
                <span className="menu-item-text">Tipos de Habitación</span>
              </Link>
              <Link to="/operadores-op" className={getMenuItemClass("operadores-op")}>
                <FaUsers className="menu-item-icon" />
                <span className="menu-item-text">Operadores</span>
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
