import React from 'react';
import './Footer.css';
// Importamos los íconos desde la librería react-icons
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-left">
          <img src='/logo_hotel.png' alt="Ríos de Agua Viva Logo" className="footer-logo" />
          <p className="footer-brand-name">Ríos de Agua Viva</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-link">
              <FaXTwitter />
            </a>
          </div>
        </div>
        <div className="footer-right">
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <p>hotelriosaguaviva@gmail.com</p>
          </div>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <p>Alp Kennel, 8753 Mollis, Suiza</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;