import React from 'react';
import inicioImg from '../assets/img/inicio.png'; // Importa la imagen

const Inicio = () => {
  return (
    <div className="container py-4">
      {/* Título y Subtítulo fuera de la card */}
      <div className="d-flex flex-column align-items-start mb-4">
        <h1 className="h3 text-dark">Gestión de Proyectos</h1>
        <p className="text-muted">Bienvenido a la plataforma de gestión de proyectos para las comunidades.</p>
      </div>

      {/* Card que contiene la imagen */}
      <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: '24px' }}>
        <div className="dashboard-card-content2">
          <img 
            src={inicioImg} 
            alt="Inicio" 
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Inicio;
