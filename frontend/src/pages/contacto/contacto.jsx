import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./contacto.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = "El mensaje debe tener al menos 10 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const templateParams = {
        name: formData.name,     
        email: formData.email,
        message: formData.message,
        to_name: "Administrador",
        reply_to: formData.email,
      };
      await emailjs.send(
        "service_p6y0ptt",
        "template_hy97i3q",
        templateParams,
        "vD6tozfo1OV4gfSRO"
      );

      setShowSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      alert(
        "Hubo un error al enviar el mensaje. Por favor, intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact__container">
        <div className="contact__header">
          <h1 className="contact__title">Contacto</h1>
          <p className="contact__subtitle">
            ¿Tienes alguna pregunta o sugerencia? ¡Nos encantaría saber de ti!
          </p>
        </div>

        {showSuccess && (
          <div className="contact__success">
            <div className="contact__success-icon">✅</div>
            <h3>¡Mensaje Enviado Correctamente!</h3>
            <p>Gracias por contactarnos. Te responderemos a la brevedad.</p>
          </div>
        )}

        <div className="contact__content">
          {/* Mapa a la izquierda */}
          <div className="contact__map-section">
            <div className="contact__map-container">
              <h3>📍 Nuestra Ubicación</h3>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2717.020158991022!2d9.0942597!3d47.079068299999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479ad2ce731365b9%3A0xa801bb6c3eb98849!2sFerienheim%20K%C3%A4nnelalp!5e0!3m2!1ses!2sar!4v1760217906317!5m2!1ses!2sar"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de ubicación"
                className="contact__iframe-map"
              ></iframe>
            </div>
            <div className="contact__info">
              <h3>📞 Información de Contacto</h3>
              <div className="contact__info-item">
                <span className="contact__info-icon">📧</span>
                <span>hotelriosaguaviva@gmail.com</span>
              </div>
              <div className="contact__info-item">
                <span className="contact__info-icon">📱</span>
                <span>+54 387 123-4567</span>
              </div>
              <div className="contact__info-item">
                <span className="contact__info-icon">📍</span>
                <span>Alp Kennel, 8753 Mollis, Suiza</span>
              </div>
            </div>
          </div>

          {/* Formulario a la derecha */}
          <div className="contact__form-section">
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__form-group">
                <label htmlFor="name" className="contact__label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`contact__input ${
                    errors.name ? "contact__input--error" : ""
                  }`}
                  placeholder="Ingresa tu nombre completo"
                />
                {errors.name && (
                  <span className="contact__error">{errors.name}</span>
                )}
              </div>

              <div className="contact__form-group">
                <label htmlFor="email" className="contact__label">
                  Dirección de Correo
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`contact__input ${
                    errors.email ? "contact__input--error" : ""
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <span className="contact__error">{errors.email}</span>
                )}
              </div>

              <div className="contact__form-group">
                <label htmlFor="message" className="contact__label">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`contact__textarea ${
                    errors.message ? "contact__input--error" : ""
                  }`}
                  placeholder="Escribe tu mensaje aquí..."
                  rows="6"
                />
                {errors.message && (
                  <span className="contact__error">{errors.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="contact__submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="contact__spinner"></span>
                    Enviando...
                  </>
                ) : (
                  <>Enviar Mensaje</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
