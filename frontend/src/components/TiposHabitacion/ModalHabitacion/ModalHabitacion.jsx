import React, { useState, useEffect } from 'react';
import { FaTimes, FaBed, FaDoorOpen } from 'react-icons/fa';
import styles from './ModalHabitacion.module.css';

export default function ModalHabitacion({ 
  isOpen, 
  onClose, 
  onSubmit, 
  habitacion = null,
  tipoHabitacionId 
}) {
  const [formData, setFormData] = useState({
    numero: '',
    piso: '',
    estado: 'Disponible'
  });

  const [errors, setErrors] = useState({});

  // Cargar datos si es edición
  useEffect(() => {
    if (habitacion) {
      setFormData({
        numero: habitacion.numero || '',
        piso: habitacion.piso || '',
        estado: habitacion.estado || 'Disponible'
      });
    } else {
      setFormData({
        numero: '',
        piso: '',
        estado: 'Disponible'
      });
    }
    setErrors({});
  }, [habitacion, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.numero.trim()) {
      newErrors.numero = 'El número de habitación es requerido';
    }

    if (!formData.piso) {
      newErrors.piso = 'El piso es requerido';
    } else if (parseInt(formData.piso) < 1) {
      newErrors.piso = 'El piso debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🔍 [Modal] Validando formulario...');
    if (!validate()) {
      console.log('❌ [Modal] Validación fallida');
      return;
    }

    const dataToSubmit = {
      ...formData,
      piso: parseInt(formData.piso),
      tipoHabitacionId: parseInt(tipoHabitacionId)
    };

    console.log('✅ [Modal] Datos a enviar:', dataToSubmit);
    console.log('📤 [Modal] Llamando a onSubmit...');
    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <FaBed className={styles.icon} />
            {habitacion ? 'Editar Habitación' : 'Nueva Habitación'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="numero">
              <FaDoorOpen className={styles.labelIcon} />
              Número de Habitación
            </label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Ej: 201, 302, Suite A"
              className={errors.numero ? styles.inputError : ''}
            />
            {errors.numero && (
              <span className={styles.errorMessage}>{errors.numero}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="piso">
              Piso
            </label>
            <input
              type="number"
              id="piso"
              name="piso"
              value={formData.piso}
              onChange={handleChange}
              placeholder="Ej: 1, 2, 3..."
              min="1"
              className={errors.piso ? styles.inputError : ''}
            />
            {errors.piso && (
              <span className={styles.errorMessage}>{errors.piso}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="Disponible">Disponible</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.btnCancel}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.btnSubmit}
            >
              {habitacion ? 'Actualizar' : 'Crear'} Habitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
