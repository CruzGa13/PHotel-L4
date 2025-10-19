import React, { useRef, useState, useEffect } from "react";
import "./ScrollReveal.css";

const ScrollReveal = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef.current);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);
  return (
    <div
      ref={elementRef}
      className={`reveal-item ${isVisible ? "is-visible" : ""}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
