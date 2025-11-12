import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState(null);
  const [onAuthSuccessCallback, setOnAuthSuccessCallback] = useState(null);

  useEffect(() => {
    // Verificar sesión al cargar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          // Obtener perfil del backend
          const response = await fetch('http://localhost:3000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const profile = await response.json();
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Usuario inició sesión
        try {
          const response = await fetch('http://localhost:3000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const profile = await response.json();
            setUser(profile);
            
            // Ejecutar callback si existe
            if (onAuthSuccessCallback) {
              onAuthSuccessCallback();
              setOnAuthSuccessCallback(null);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        // Usuario cerró sesión
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /**
   * Abrir modal de autenticación con opciones
   * @param {Object} options - Opciones del modal
   * @param {string} options.reason - Razón de apertura ("checkout", etc.)
   * @param {Function} options.onSuccess - Callback a ejecutar tras login exitoso
   */
  const openAuthModal = ({ reason, onSuccess } = {}) => {
    setAuthModalReason(reason || null);
    setOnAuthSuccessCallback(() => onSuccess); // Wrap in function to store function reference
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalReason(null);
    setOnAuthSuccessCallback(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      signOut,
      authModalOpen,
      authModalReason,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
