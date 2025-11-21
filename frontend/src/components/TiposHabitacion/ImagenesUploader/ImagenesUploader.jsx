import { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';
import './ImagenesUploader.css';

export default function ImagenesUploader({ imagenes, onChange, imagenesAEliminar, setImagenesAEliminar }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Handlers de drag & drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    procesarArchivos(files);
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    procesarArchivos(files);
  };
  
  const procesarArchivos = (files) => {
    const imagenesValidas = files.filter(file => {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`);
        return false;
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} es demasiado grande. Máximo 5MB`);
        return false;
      }
      
      return true;
    });
    
    // Convertir a URLs temporales (en producción se subirían a Supabase)
    imagenesValidas.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const nuevaImagen = {
          id: `temp_${Date.now()}_${Math.random()}`, // ID temporal como string
          url: e.target.result,
          descripcion: file.name,
          file: file // Guardar archivo para subir después
        };
        
        onChange([...imagenes, nuevaImagen]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleEliminarImagen = (imagenId) => {
    if (window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      console.log('🗑️ [ELIMINAR] Iniciando eliminación...');
      console.log('🗑️ [ELIMINAR] ID a eliminar:', imagenId);
      console.log('🗑️ [ELIMINAR] Tipo de ID:', typeof imagenId);
      console.log('🗑️ [ELIMINAR] Imágenes actuales:', imagenes.length);
      console.log('🗑️ [ELIMINAR] Todas las imágenes:', imagenes.map(img => ({ id: img.id, tipo: typeof img.id, url: img.url })));
      
      // Buscar la imagen a eliminar
      const imagenAEliminar = imagenes.find(img => img.id === imagenId);
      console.log('🗑️ [ELIMINAR] Imagen encontrada:', imagenAEliminar);
      
      // Si la imagen tiene un ID numérico (viene de BD), agregarla a la lista de eliminación
      if (imagenAEliminar && typeof imagenAEliminar.id === 'number' && setImagenesAEliminar) {
        console.log('✅ [ELIMINAR] Imagen de BD, agregando a lista de eliminación');
        console.log('✅ [ELIMINAR] imagenesAEliminar ANTES:', imagenesAEliminar);
        setImagenesAEliminar([...imagenesAEliminar, imagenAEliminar]);
        console.log('✅ [ELIMINAR] imagenesAEliminar DESPUÉS:', [...imagenesAEliminar, imagenAEliminar]);
      } else {
        console.log('📋 [ELIMINAR] Imagen nueva (temporal), solo se elimina del estado');
      }
      
      // Eliminar del estado actual
      const imagenesRestantes = imagenes.filter(img => img.id !== imagenId);
      console.log('🗑️ [ELIMINAR] Imágenes restantes:', imagenesRestantes.length);
      console.log('🗑️ [ELIMINAR] Detalle restantes:', imagenesRestantes.map(img => ({ id: img.id, url: img.url })));
      onChange(imagenesRestantes);
    }
  };
  
  const handleActualizarDescripcion = (imagenId, nuevaDescripcion) => {
    onChange(imagenes.map(img => 
      img.id === imagenId 
        ? { ...img, descripcion: nuevaDescripcion }
        : img
    ));
  };
  
  return (
    <div className="imagenes-uploader">
      {/* Zona de drag & drop */}
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <FaCloudUploadAlt className="upload-icon" />
        <h3 className="dropzone-title">
          {isDragging ? '¡Suelta las imágenes aquí!' : 'Arrastrá y soltá imágenes aquí'}
        </h3>
        <p className="dropzone-subtitle">
          o hacé clic para seleccionar archivos
        </p>
        <p className="dropzone-info">
          Formatos: JPG, PNG, GIF, WebP • Máximo 5MB por imagen
        </p>
      </div>
      
      {/* Grid de imágenes */}
      {imagenes.length > 0 ? (
        <div className="imagenes-grid">
          {imagenes.map((imagen) => (
            <div key={imagen.id} className="imagen-card">
              <div className="imagen-preview">
                <img src={imagen.url} alt={imagen.descripcion || 'Imagen'} />
                <button
                  className="btn-eliminar"
                  onClick={() => handleEliminarImagen(imagen.id)}
                  title="Eliminar imagen"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="imagen-info">
                <input
                  type="text"
                  value={imagen.descripcion || ''}
                  onChange={(e) => handleActualizarDescripcion(imagen.id, e.target.value)}
                  placeholder="Descripción de la imagen..."
                  className="descripcion-input"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaImage className="empty-icon" />
          <p>Este tipo de habitación aún no tiene imágenes cargadas</p>
          <button className="btn-upload-empty" onClick={handleClickUpload}>
            <FaCloudUploadAlt /> Subir primera imagen
          </button>
        </div>
      )}
      
      {/* Información adicional */}
      {imagenes.length > 0 && (
        <div className="imagenes-footer">
          <p className="imagenes-count">
            {imagenes.length} imagen{imagenes.length !== 1 ? 'es' : ''} cargada{imagenes.length !== 1 ? 's' : ''}
          </p>
          <button className="btn-agregar-mas" onClick={handleClickUpload}>
            <FaCloudUploadAlt /> Agregar más imágenes
          </button>
        </div>
      )}
    </div>
  );
}
