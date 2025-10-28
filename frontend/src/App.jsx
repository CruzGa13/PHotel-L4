import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import Inicio from "./pages/inicio/inicio";
import HabitacionesModule from "./pages/habitaciones/Habitaciones"; 
import DetalleHabitacionPage from "./pages/DetalleHabitacion/DetalleHabitacionPage";
import ResumenReserva from "./pages/ResumenReserva";
import Contacto from "./pages/contacto/contacto"; 
import ServiciosModule from "./pages/servicios/servicios";
import Breadcrumb from "./components/Breadcrumb/Breadcrumb.jsx"; 
import { FaBars } from "react-icons/fa";
import "./index.css";

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("inicio");
  const [showBreadcrumb, setShowBreadcrumb] = useState(true);
  const location = useLocation();

  // 🔹 Solo controla la visibilidad del breadcrumb
  useEffect(() => {
    const handleScroll = () => {
      setShowBreadcrumb(window.scrollY < 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }

    const path = location.pathname;
    if (path === "/" || path === "/inicio") {
      setActiveItem("inicio");
    } else if (path.includes("/habitaciones")) {
      setActiveItem("habitaciones");
    } else if (path.includes("/servicios")) {
      setActiveItem("servicios");
    } else if (path.includes("/contacto")) {
      setActiveItem("contacto");
    } else if (path.includes("/movimiento")) {
      setActiveItem("movimiento");
    }
  }, [location.pathname]);

  const isHomePage = location.pathname === "/" || location.pathname === "/inicio";

  return (
    <>
      {/* 🔸 Botón de menú (sin cambios) */}
      {!isSidebarOpen && (
        <button
          className="hamburger-button"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars />
        </button>
      )}

      {/* 🔸 Breadcrumb — solo desaparece al hacer scroll */}
      {!isSidebarOpen && !isHomePage && (
        <div
          className={`breadcrumb-inline-wrapper ${
            showBreadcrumb ? "" : "hidden"
          }`}
        >
          <Breadcrumb />
        </div>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeItem}
      />

      {/* 🔹 CORRECCIÓN: Toaster para notificaciones globales */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#111827',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#055d15',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />

      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/habitaciones" element={<HabitacionesModule />} />
          {/* 🔹 CORRECCIÓN: Nueva ruta para detalle de habitación
              IMPORTANTE: Esta ruta debe estar DESPUÉS de /habitaciones
              para que no capture la ruta general */}
          <Route path="/habitaciones/:id" element={<DetalleHabitacionPage />} />
          {/* 🔹 Nueva ruta para resumen de reserva */}
          <Route path="/resumen-reserva" element={<ResumenReserva />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/servicios" element={<ServiciosModule />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
