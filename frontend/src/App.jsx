import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import Inicio from "./pages/inicio/inicio";
import HabitacionesModule from "./pages/habitaciones/habitaciones"; 
import ReservaPage from "./pages/reserva/reserva";
import DetalleHabitacionPage from "./pages/DetalleHabitacion/DetalleHabitacionPage";
import ResumenReserva from "./pages/ResumenReserva";
import ReservaConfirmada from "./pages/ReservaConfirmada";
import Contacto from "./pages/contacto/contacto"; 
import ServiciosModule from "./pages/servicios/servicios";
import MapaPage from "./features/mapa/MapaPage";
import ReservaOp from "./pages/ReservaOp/ReservaOp";
import HabitacionesOp from "./pages/HabitacionesOp/HabitacionesOp";
import DetalleHabitaciones from "./pages/DetalleHabitaciones/DetalleHabitaciones";
import MapaHabitaciones from "./pages/MapaHabitaciones/MapaHabitaciones";
import Breadcrumb from "./components/BreadCrumb/BreadCrumb.jsx";
import ScrollToTopOffset from "./ScrollToTopOffset";
import { FaBars } from "react-icons/fa";
import "./index.css";

// Lazy loading para páginas de operador y administrador
const MensajesOp = lazy(() => import("./pages/MensajesOp/MensajesOp"));
const OperadoresPage = lazy(() => import("./pages/OperadoresPage/OperadoresPage"));
const TiposHabitacionPage = lazy(() => import("./pages/TiposHabitacionPage/TiposHabitacionPage"));
const EditarTipoHabitacion = lazy(() => import("./pages/EditarTipoHabitacion/EditarTipoHabitacion"));
const NuevoTipoHabitacion = lazy(() => import("./pages/NuevoTipoHabitacion/NuevoTipoHabitacion"));
const AdminConsultasPage = lazy(() => import("./pages/AdminConsultasPage/AdminConsultasPage"));

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

  // Auto-dismiss toasts al cambiar de ruta
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  useEffect(() => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }

    const path = location.pathname;
    if (path === "/" || path === "/inicio") {
      setActiveItem("inicio");
    } else if (path.includes("/habitaciones-op")) {
      setActiveItem("habitaciones-op");
    } else if (path.includes("/habitaciones")) {
      setActiveItem("habitaciones");
    } else if (path.includes("/reserva")) {
      setActiveItem("reserva");
    } else if (path.includes("/servicios")) {
      setActiveItem("servicios");
    } else if (path.includes("/contacto")) {
      setActiveItem("contacto");
    } else if (path.includes("/reserva-op")) {
      setActiveItem("reserva-op");
    } else if (path.includes("/mensajes-op")) {
      setActiveItem("mensajes-op");
    } else if (path.includes("/operadores-op")) {
      setActiveItem("operadores-op");
    } else if (path.includes("/mapa-habitaciones")) {
      setActiveItem("mapa-habitaciones");
    } else if (path.includes("/crud-habitaciones")) {
      setActiveItem("crud-habitaciones");
    } else if (path.includes("/admin/consultas-graficos")) {
      setActiveItem("admin-consultas");
    } else if (path.includes("/movimiento")) {
      setActiveItem("movimiento");
    }
  }, [location.pathname]);

  const isHomePage = location.pathname === "/" || location.pathname === "/inicio";
  
  // Páginas que manejan su propio breadcrumb (modo controlado)
  const hasOwnBreadcrumb = 
    location.pathname.startsWith('/habitaciones/') || // Detalle de habitación
    location.pathname === '/resumen-reserva' ||       // Pre-reserva
    location.pathname === '/reserva-confirmada' ||    // Confirmación
    location.pathname === '/mensajes-op' ||           // Mensajes operador
    location.pathname === '/operadores-op' ||         // Operadores
    location.pathname === '/habitaciones-op' ||       // Habitaciones operador
    location.pathname.startsWith('/habitaciones-op/') || // Detalle habitación operador
    location.pathname === '/reserva-op' ||            // Reservas operador
    location.pathname === '/mapa-habitaciones' ||     // Mapa habitaciones
    location.pathname === '/crud-habitaciones' ||             // Tipos de habitación
    location.pathname.startsWith('/crud-habitaciones/editar/') || // Editar tipo de habitación
    location.pathname === '/crud-habitaciones/nuevo' ||       // Nuevo tipo de habitación
    location.pathname === '/admin/consultas-graficos';        // Consultas y gráficos admin

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

      {/* 🔸 Breadcrumb global — solo desaparece al hacer scroll */}
      {/* NO se muestra en páginas que tienen breadcrumb controlado */}
      {!isSidebarOpen && !isHomePage && !hasOwnBreadcrumb && (
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
          duration: 2500,
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

      {/* 🔹 ToastContainer para react-toastify (usado en cambios de estado) */}
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

      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/habitaciones" element={<HabitacionesModule />} />
          {/* 🔹 CORRECCIÓN: Nueva ruta para detalle de habitación
              IMPORTANTE: Esta ruta debe estar DESPUÉS de /habitaciones
              para que no capture la ruta general */}
          <Route path="/habitaciones/:id" element={<DetalleHabitacionPage />} />
          {/* 🔹 Ruta para página de reservas */}
          <Route path="/reserva" element={<ReservaPage />} />
          {/* 🔹 Nueva ruta para resumen de reserva */}
          <Route path="/resumen-reserva" element={<ResumenReserva />} />
          {/* 🔹 Nueva ruta para confirmación de reserva */}
          <Route path="/reserva-confirmada" element={<ReservaConfirmada />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/servicios" element={<ServiciosModule />} />
          <Route path="/mapa" element={<MapaPage />} />
          <Route path="/habitaciones-op" element={<HabitacionesOp />} />
          <Route path="/habitaciones-op/:id" element={<DetalleHabitaciones />} />
          <Route path="/mapa-habitaciones" element={<MapaHabitaciones />} />
          <Route path="/reserva-op" element={<ReservaOp />} />
          <Route path="/mensajes-op" element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', fontSize: '18px', color: '#6b7280' }}>Cargando...</div>}>
              <MensajesOp />
            </Suspense>
          } />
          <Route path="/operadores-op" element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', fontSize: '18px', color: '#6b7280' }}>Cargando...</div>}>
              <OperadoresPage />
            </Suspense>
          } />
          <Route path="/crud-habitaciones" element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', fontSize: '18px', color: '#6b7280' }}>Cargando...</div>}>
              <TiposHabitacionPage />
            </Suspense>
          } />
          <Route path="/crud-habitaciones/editar/:id" element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', fontSize: '18px', color: '#6b7280' }}>Cargando...</div>}>
              <EditarTipoHabitacion />
            </Suspense>
          } />
          <Route path="/crud-habitaciones/nuevo" element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', fontSize: '18px', color: '#6b7280' }}>Cargando...</div>}>
              <NuevoTipoHabitacion />
            </Suspense>
          } />
          <Route path="/admin/consultas-graficos" element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', fontSize: '18px', color: '#6b7280' }}>Cargando...</div>}>
              <AdminConsultasPage />
            </Suspense>
          } />
        </Routes>
      </main>

      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOffset />
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
