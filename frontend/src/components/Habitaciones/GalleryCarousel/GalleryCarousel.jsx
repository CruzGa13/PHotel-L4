import { useState, useRef } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './GalleryCarousel.css';

/**
 * Componente de galería tipo carrusel con imagen principal y miniaturas
 * @param {Object} props
 * @param {Array<{url: string, descripcion?: string}>} props.images - Array de imágenes
 * @param {boolean} props.loading - Estado de carga
 */
export default function GalleryCarousel({ images = [], loading = false }) {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);

  // Configuración del carrusel principal
  const mainSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: nav2,
    ref: sliderRef1,
    adaptiveHeight: false,
    lazyLoad: 'progressive',
  };

  // Configuración de las miniaturas
  const thumbSettings = {
    slidesToShow: 6,
    slidesToScroll: 1,
    asNavFor: nav1,
    ref: sliderRef2,
    focusOnSelect: true,
    centerMode: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
        }
      }
    ]
  };

  // Skeleton mientras carga
  if (loading) {
    return (
      <div className="gallery-carousel">
        <div className="main-image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
        <div className="thumbnails-skeleton">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="thumbnail-skeleton">
              <div className="skeleton-shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Placeholder si no hay imágenes
  if (!images || images.length === 0) {
    return (
      <div className="gallery-carousel">
        <div className="placeholder-container">
          <div className="placeholder-icon">
            <svg 
              className="w-24 h-24 text-slate-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <p className="placeholder-text">Sin imágenes disponibles</p>
        </div>
      </div>
    );
  }

  // Navegación personalizada
  const goToPrev = () => sliderRef1.current?.slickPrev();
  const goToNext = () => sliderRef1.current?.slickNext();

  return (
    <div className="gallery-carousel">
      {/* Carrusel Principal */}
      <div className="main-carousel-container">
        <Slider 
          {...mainSettings}
          beforeChange={() => setNav1(sliderRef1.current)}
          afterChange={() => setNav2(sliderRef2.current)}
        >
          {images.map((image, index) => (
            <div key={image.id || index} className="main-slide">
              <div className="main-image-wrapper">
                <img
                  src={image.url}
                  alt={image.descripcion || `Imagen ${index + 1}`}
                  className="main-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          ))}
        </Slider>

        {/* Flechas personalizadas */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="arrow-button arrow-left"
              aria-label="Imagen anterior"
              type="button"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="arrow-button arrow-right"
              aria-label="Siguiente imagen"
              type="button"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="thumbnails-container">
          <Slider {...thumbSettings}>
            {images.map((image, index) => (
              <div key={image.id || index} className="thumbnail-slide">
                <div className="thumbnail-wrapper">
                  <img
                    src={image.url}
                    alt={`Miniatura ${index + 1}`}
                    className="thumbnail-image"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
}
