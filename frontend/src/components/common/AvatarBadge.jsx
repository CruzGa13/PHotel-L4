import React from 'react';

// Función para generar color estable a partir de un string
const getColorFromString = (str) => {
  if (!str) return '#6b7280'; // gris por defecto
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Paleta de colores profesionales
  const colors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Función para obtener inicial
const getInitial = (user) => {
  if (user.nombre) {
    return user.nombre.charAt(0).toUpperCase();
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return 'U';
};

const AvatarBadge = ({ user, size = 40 }) => {
  if (!user) return null;

  const initial = getInitial(user);
  const backgroundColor = getColorFromString(user.nombre || user.email);

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.nombre || user.email}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: size * 0.45,
      }}
    >
      {initial}
    </div>
  );
};

export default AvatarBadge;
