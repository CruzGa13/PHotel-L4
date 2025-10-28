import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReservaOp from "./pages/reservaOp/reservaOp";
import MensajesOp from "./pages/MensajesOp/MensajesOp";
import HabitacionesOp from "./pages/HabitacionesOp/HabitacionesOp";
import DetalleHabitaciones from './pages/DetalleHabitaciones/DetalleHabitaciones';
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta única */}
        <Route path="/" element={<HabitacionesOp />} />
        <Route path="/habitaciones/:id" element={<DetalleHabitaciones />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
