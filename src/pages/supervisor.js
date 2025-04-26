import React from 'react';

const Supervisor = () => {
  return (
    <div className="supervisor-container">
      <h1 className='title'>Control de Supervisor</h1>
      
      <div className="panels-container">
        {/* Panel principal (70% de ancho) */}
        <div className="panel-main">
          <h2 className="panel-title">Panel Principal</h2>
          <div className="panel-content">
            {/* Aquí irá el contenido del panel principal */}
            <p>Contenido del panel principal (70% de ancho)</p>
          </div>
        </div>

        {/* Panel secundario (30% de ancho) */}
        <div className="panel-side">
          <h2 className="panel-title">Panel Secundario</h2>
          <div className="panel-content">
            {/* Aquí irá el contenido del panel secundario */}
            <p>Contenido del panel secundario (30% de ancho)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supervisor;