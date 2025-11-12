// src/components/Habitaciones/RegistrarHabitacion/RegistrarHabitacion.jsx

import React, { useState } from 'react';
import './RegistrarHabitacion.css'; // Usaremos este CSS

export default function RegistrarHabitacion({ onClose, onSave }) {
  // Estado local para cada campo del formulario
  const [nro, setNro] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Estándar'); // Valor por defecto
  const [tipoEspacio, setTipoEspacio] = useState('Individual'); // Valor por defecto
  const [huespedes, setHuespedes] = useState(1);
  const [observacion, setObservacion] = useState('');

  const handleSubmit = () => {
    // Validación simple
    if (!nro || !nombre) {
      alert('Por favor, complete al menos el número y el nombre.');
      return;
    }

    // Creamos el objeto de la nueva habitación
    const nuevaHabitacion = {
      id: Date.now(), // ID único simple (en una app real vendría de la DB)
      nro_habitacion: nro,
      nombre: nombre,
      categoria: categoria,
      tipo_espacio: tipoEspacio,
      cantidad_huespedes: parseInt(huespedes, 10),
      fecha_registro: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      estado: 'Activa', // Las habitaciones nuevas nacen 'Activa'
      observacion: observacion,
      historial: [
        {
          accion: 'Creación de habitación',
          usuario: 'Admin', // Asumimos el usuario
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    // Llamamos a la función onSave que nos pasó el padre (HabitacionesOp)
    onSave(nuevaHabitacion);
    
    // Cerramos el modal
    onClose();
  };

  return (
    // Overlay oscuro
    <div className="modal-overlay fade-in" onClick={onClose}>
      
      {/* Contenido del modal */}
      <section
        className="glass modal-content"
        onClick={(e) => e.stopPropagation()} // Evita que el clic cierre el modal
      >
        
        {/* Cabecera del modal */}
        <div className="modal-header">
          <div>
            <h2 className="gradient-text">Registrar Nueva Habitación</h2>
            <p className="muted">Complete los datos de la nueva habitación.</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="modal-body">
          <form className="form-layout">
            
            {/* Fila 1 */}
            <div className="form-grid two-cols">
              <div className="form-group">
                <label htmlFor="nro_hab">N° Habitación</label>
                <input
                  id="nro_hab"
                  type="text"
                  className="input"
                  placeholder="Ej: 103"
                  value={nro}
                  onChange={(e) => setNro(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="nombre_hab">Nombre</label>
                <input
                  id="nombre_hab"
                  type="text"
                  className="input"
                  placeholder="Ej: Suite Junior"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>

            {/* Fila 2 */}
            <div className="form-grid two-cols">
              <div className="form-group">
                <label htmlFor="categoria_hab">Categoría</label>
                <select
                  id="categoria_hab"
                  className="select"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option>Estándar</option>
                  <option>Doble</option>
                  <option>Deluxe</option>
                  <option>Suite</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tipo_hab">Tipo de Espacio</label>
                <select
                  id="tipo_hab"
                  className="select"
                  value={tipoEspacio}
                  onChange={(e) => setTipoEspacio(e.target.value)}
                >
                  <option>Individual</option>
                  <option>Doble</option>
                  <option>Triple</option>
                  <option>Compartido</option>
                </select>
              </div>
            </div>

            {/* Fila 3 */}
            <div className="form-grid one-col">
              <div className="form-group">
                <label htmlFor="huespedes_hab">Max. Huéspedes</label>
                <input
                  id="huespedes_hab"
                  type="number"
                  className="input"
                  min="1"
                  value={huespedes}
                  onChange={(e) => setHuespedes(e.target.value)}
                />
              </div>
            </div>

            {/* Fila 4 */}
            <div className="form-grid one-col">
              <div className="form-group">
                <label htmlFor="obs_hab">Observaciones (Opcional)</label>
                <textarea
                  id="obs_hab"
                  className="textarea"
                  rows="3"
                  placeholder="Ej: Cama extra disponible, cuna bajo petición..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        {/* Acciones del Footer */}
        <div className="modal-footer">
          <button className="btn btn-gray" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-blue" onClick={handleSubmit}>
            Guardar Habitación
          </button>
        </div>
      </section>
    </div>
  );
}