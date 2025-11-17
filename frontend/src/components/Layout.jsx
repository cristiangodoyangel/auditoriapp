import React from 'react';
import logo from '../assets/logo.ico';
import { Link, useNavigate } from 'react-router-dom';

// --- Icono de Cerrar Sesión ---
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);

// --- 1. AÑADIMOS EL ICONO DE MENÚ (HAMBURGUESA) ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
);
// ----------------------------------------------------

// --- Componente NavLink (para Desktop) ---
const NavLink = ({ to, children, className }) => (
  <li>
    <Link to={to} className={className}>
      {children}
    </Link>
  </li>
);

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const userComunidad = user?.es_auditor ? 'Rol: Auditor' : (user?.comunidad?.nombre || user?.comunidad_nombre || 'Comunidad');

  return (
    // Contenedor principal (sin ancho fijo)
    <div className="min-h-screen flex flex-col bg-base-200 max-w-[1200px] mx-auto">
      
      {/* 2. El Navbar Superior */}
      <header className="navbar h-20 bg-base-100 shadow-md sticky top-0 z-30">
        
        <div className="navbar-start">
          
          {/* --- 2. AÑADIMOS EL MENÚ MÓVIL (DROPDOWN) --- */}
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <MenuIcon />
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link to="/dashboard">Inicio</Link></li>
              <li><Link to="/proyectos">Proyectos</Link></li>
              <li><Link to="/rendiciones">Rendiciones</Link></li>
              <li><Link to="/periodos">Periodos</Link></li>
              <li><Link to="/socios">Socios</Link></li>
            </ul>
          </div>
          {/* --- FIN DE MENÚ MÓVIL --- */}

          {/* Logo (visible en pantallas > sm) */}
          <Link
            to="/dashboard"
            className="normal-case text-2xl hidden sm:flex items-center hover:opacity-75"
          >
            <img src={logo} alt="Logo" className="w-12 h-12" />
            <span className="ml-2 text-primary">Gestión Comunidades</span>
          </Link>
        </div>

        {/* --- Centro: Menú Desktop (se oculta en < lg) --- */}
        <div className="navbar-center hidden lg:flex">
          <ul className="flex flex-row items-center space-x-1">
            <NavLink
              className="px-4 py-2 rounded-lg hover:bg-primary hover:text-primary-content"
              to="/dashboard"
            >
              Inicio
            </NavLink>
            <NavLink
              className="px-4 py-2 rounded-lg hover:bg-primary hover:text-primary-content"
              to="/proyectos"
            >
              Proyectos
            </NavLink>
            <NavLink
              className="px-4 py-2 rounded-lg hover:bg-primary hover:text-primary-content"
              to="/rendiciones"
            >
              Rendiciones
            </NavLink>
            <NavLink
              className="px-4 py-2 rounded-lg hover:bg-primary hover:text-primary-content"
              to="/periodos"
            >
              Periodos
            </NavLink>
            <NavLink
              className="px-4 py-2 rounded-lg hover:bg-primary hover:text-primary-content"
              to="/socios"
            >
              Socios
            </NavLink>
          </ul>
        </div>
        
        {/* --- Lado Derecho: Dropdown de Usuario --- */}
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost">
              <div className="flex flex-col items-end">
                <span className="font-medium">
                  {user?.nombre || user?.username || "Usuario"}
                </span>
                <span className="text-xs text-base-content/70">
                  {userComunidad}
                </span>
              </div>
              <svg width="16" height="16" fill="currentColor" className="ml-1">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={handleLogout}>
                  <LogoutIcon />
                  Cerrar sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* 3. Contenido Principal (con container responsive) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto shadow-md ">
        <div className="bg-white rounded-box shadow p-4 sm:p-6 min-h-[80vh]">
          {children}
        </div>
      </main>

      {/* 4. Footer (con container responsive) */}
      <footer className="footer sm:footer-horizontal footer-center bg-base-100 shadow-md  text-base-content p-4 w-full max-w-7xl mx-auto">
        <aside>
          <p>Desarrollado por <a class="text-secondary font-bold" href="https://www.weblogica.cl" target="_blank" rel="noopener noreferrer" className="link link-hover">www.weblogica.cl</a></p>
        </aside>
      </footer>
    </div>
  );
}