import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ReservaCard.css';

/**
 * ReservaCard - Tarjeta para mostrar habitaciones en la página de reservas
 * Diseño tipo catálogo con imagen grande, información básica y botón de reserva
 * Usa Swiper.js para carrusel profesional con animaciones suaves
 */
export function ReservaCard({ habitacion }) {
  const navigate = useNavigate();

  // Obtener todas las imágenes únicas disponibles
  const images = useMemo(() => {
    // Si habitacion.images ya es un array, usarlo directamente
    if (Array.isArray(habitacion.images)) {
      const validImages = habitacion.images.filter(img => img && img !== '/placeholder-room.jpg');
      // Eliminar duplicados
      return [...new Set(validImages)];
    }
    
    // Fallback para compatibilidad con formato antiguo
    const allImages = [
      habitacion.image1,
      habitacion.image2
    ].filter(img => img && img !== '/placeholder-room.jpg');
    
    return [...new Set(allImages)];
  }, [habitacion.images, habitacion.image1, habitacion.image2]);

  const hasMultipleImages = images.length > 1;

  const handleReservar = () => {
    console.log('🏨 Navegando a reserva de habitación:', habitacion._id);
    navigate(`/habitaciones/${habitacion._id}`);
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="reserva-card">
      {/* Carrusel de imágenes con Swiper */}
      <div className="reserva-card-image-container">
        {hasMultipleImages ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            className="reserva-swiper"
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`${habitacion.name} - Imagen ${index + 1}`}
                  className="reserva-card-image"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src={images[0] || habitacion.images?.[0] || habitacion.image1 || '/placeholder-room.jpg'}
            alt={habitacion.name}
            className="reserva-card-image"
          />
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="reserva-card-content">
        {/* Título */}
        <h3 className="reserva-card-title">{habitacion.name}</h3>

        {/* Info de capacidad y precio */}
        <div className="reserva-card-info">
          <div className="reserva-card-capacity">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="icon-person"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Hasta {habitacion.huespedes}</span>
          </div>

          <div className="reserva-card-price">
            <span className="price-amount">{formatPrice(habitacion.price)}</span>
            <span className="price-period">/noche</span>
          </div>
        </div>

        {/* Botón de reserva */}
        <button className="btn-reservar-card" onClick={handleReservar}>
          Reservar
        </button>
      </div>
    </div>
  );
}
