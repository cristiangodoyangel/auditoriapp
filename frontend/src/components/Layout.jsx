import React from 'react';
import logo from '../assets/logo.ico';
import { Link, useNavigate } from 'react-router-dom';

// --- Icono de Cerrar Sesión ---
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);
// -------------------------

// --- Componente NavLink CORREGIDO (acepta y pasa className) ---
const NavLink = ({ to, children, className }) => (
  <li>
    <Link to={to} className={className}>
      {children}
    </Link>
  </li>
);

export default function Layout({ children }) {
  // --- Sin useState, useRef, o useEffect ---
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const userComunidad = user?.es_auditor ? 'Rol: Auditor' : (user?.comunidad?.nombre || user?.comunidad_nombre || 'Comunidad');

  return (
    // 1. Contenedor principal (con className)
    <div
      className="min-h-screen flex flex-col bg-base-200"
      style={{ width: "1200px", margin: "auto" }}
    >
      {/* 2. El Navbar Superior (con className) */}
      <header className="navbar h-20 bg-base-100 shadow-md sticky top-0 z-30">
        {/* --- Lado Izquierdo (con className) --- */}
        <div className="navbar-start">
          {/* --- 1. Quitamos 'btn' y 'btn-ghost' --- */}
          {/* --- 2. Añadimos 'items-center' para alinear el logo y el texto --- */}
          {/* --- 3. Añadimos un hover sutil (opacidad) que no parece un botón --- */}
          <Link
            to="/dashboard"
            className="normal-case text-2xl hidden sm:flex items-center hover:opacity-75"
          >
            {/* --- 4. Corregimos a un tamaño válido (w-10 h-10 o w-12 h-12) --- */}
            <img src={logo} alt="Logo" className="w-12 h-12" />
            <span className="ml-2 text-primary">Gestión Comunidades</span>
          </Link>
        </div>
        {/* --- Centro: Menú Desktop (CORREGIDO con clases hover) --- */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <NavLink
              className="hover:bg-primary hover:text-primary-content"
              to="/dashboard"
            >
              Inicio
            </NavLink>
            <NavLink
              className="hover:bg-primary hover:text-primary-content"
              to="/proyectos"
            >
              Proyectos
            </NavLink>
            <NavLink
              className="hover:bg-primary hover:text-primary-content"
              to="/rendiciones"
            >
              Rendiciones
            </NavLink>
            <NavLink
              className="hover:bg-primary hover:text-primary-content"
              to="/periodos"
            >
              Periodos
            </NavLink>
            <NavLink
              className="hover:bg-primary hover:text-primary-content"
              to="/socios"
            >
              Socios
            </NavLink>
          </ul>
        </div>
        {/* --- Lado Derecho: Dropdown (CORREGIDO - sin state y con className) --- */}
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
          </div>{" "}
          {/* Fin de .dropdown */}
        </div>{" "}
        {/* Fin de .navbar-end */}
      </header>

      {/* 3. Contenido Principal (con className) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="bg-base-100 rounded-box shadow p-4 sm:p-6 min-h-[80vh]">
          {children}
        </div>
      </main>
    </div>
  );
}