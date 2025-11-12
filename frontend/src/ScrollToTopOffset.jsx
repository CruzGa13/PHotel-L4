import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopOffset
 * 
 * Componente que gestiona el scroll automático al cambiar de ruta.
 * Posiciona la página con un offset desde el tope (útil cuando hay headers fijos).
 * 
 * No renderiza nada, solo maneja el efecto de scroll.
 */
export default function ScrollToTopOffset() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Offset en píxeles desde el tope (ajustar según altura del header)
    const OFFSET = 0;
    
    // Scroll instantáneo al tope con offset
    // Usar 'smooth' en lugar de 'instant' para animación suave
    window.scrollTo({
      top: OFFSET,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  // No renderiza nada
  return null;
}
