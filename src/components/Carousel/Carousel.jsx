import React, { useState } from 'react';
import './Carousel.css';

const Carousel = () => {
  const slides = [
    {
      image: '/montana_carousel.png',
      title: 'Fronalpstock',
      text: 'Respire el aire fresco de la montaña y relaje su mente',
    },
    {
      image: 'habitacion_carousel.png',
      title: 'Confort y Elegancia',
      text: 'Cada detalle está pensado para su bienestar. Disfrute de un ambiente de lujo y serenidad',
    },
    {
      image: 'casados_carousel.png',
      title: 'Recuerdo permanente',
      text: 'Cree recuerdos imborrables junto a esa persona especial en un entorno de ensueño',
    },
  ];

  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">Nuestras diferencias</h2>
      <div className="carousel-container">
        <button className="arrow left" onClick={prevSlide}>
          &#8592;
        </button>

        <div className="carousel-track">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === current ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {index === current && (
                <div className="carousel-content">
                  <h3>{slide.title}</h3>
                  <p>{slide.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="arrow right" onClick={nextSlide}>
          &#8594;
        </button>
      </div>
    </section>
  );
};

export default Carousel;