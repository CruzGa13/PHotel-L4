import React from 'react';
import './BlockQuote.css';
const BlockQuote = () => {
  return (
    <section className="cita-contenedor">
      <blockquote className="flujo-vida-quote">
        <h2 className="quote-titulo">Flujo de vida verdadera</h2>
        <p className="quote-texto">
          Ríos de Agua Viva es el estándar definitivo en hospitalidad de lujo
          con propósito. Inspirados en la promesa de que “de su interior
          correrán ríos de agua viva”, nuestro santuario meticulosamente
          diseñado fusiona la excelencia cinco estrellas con una serenidad
          profunda. Somos un recurso vital para todos: proporcionamos
          foco estratégico al profesional y reposo genuino a la familia.
        </p>
      </blockquote>
    </section>
  );
};

export default BlockQuote;
