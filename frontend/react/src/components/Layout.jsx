// src/components/Layout.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logo.png';  // Asegúrate de que la ruta sea correcta

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Sidebar or Navigation */}
      <nav className="sidebar">
        {/* Logo en el sidebar */}
        <div className="logo-container">
          <img src={logo} alt="GDP" className="logo" /> {/* Agrega una clase para el logo */}
        </div>

        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/resumen">Resumen</Link></li>
          <li><Link to="/proyectos">Proyectos</Link></li>
          <li><Link to="/beneficiarios">Socios</Link></li>
          <li><Link to="/documentos">Documentos</Link></li>
          <li><Link to="/revision-documentos">Revisión</Link></li>
        </ul>
        
      </nav>

      {/* Main content */}
      <main className="main-content">
        {children} {/* Aquí se renderizan las páginas específicas */}
      </main>
    </div>
  );
};

export default Layout;
