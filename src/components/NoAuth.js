// components/NoAuth.js
import React from 'react';

export default function UnauthorizedAlert() {
  return (
    <div className="unauthorized-alert">
      <h2>No tienes permisos para acceder a esta página.</h2>
      <p>Por favor, contacta con un administrador si necesitas acceso.</p>
    </div>
  );
}
