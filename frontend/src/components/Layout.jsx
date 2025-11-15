import React from 'react';
import logo from '../assets/logo.ico';
import { Link, useNavigate } from 'react-router-dom';

// --- Iconos para la UI ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);
// -------------------------

const NavLink = ({ to, children }) => (
  <li><Link to={to}>{children}</Link></li>
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
    // 1. Contenedor principal
    // --- CORREGIDO: class -> className ---
    <div
      className="min-h-screen flex flex-col bg-base-200"
      style={{ width: "1200px", margin: "auto" }}
    >
      {/* 2. El Navbar Superior */}
      {/* --- CORREGIDO: class -> className --- */}
      <header className="navbar bg-base-100 shadow-md sticky top-0 z-30">
        {/* --- Lado Izquierdo --- */}
        {/* --- CORREGIDO: class -> className --- */}
        <div className="navbar-start">
          {/* --- CORREGIDO: class -> className --- */}
          <Link
            to="/dashboard"
            className="btn btn-ghost normal-case text-xl hidden sm:flex"
          >
            {/* --- CORREGIDO: class -> className --- */}
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="ml-2">Gestión Comunidades</span>
          </Link>
        </div>

        {/* --- Centro: Menú Desktop --- */}
        {/* --- CORREGIDO: class -> className --- */}
        <div className="navbar-center hidden lg:flex">
          {/* --- CORREGIDO: class -> className --- */}
          {/* También quité 'btn-primary' de aquí, no tiene sentido en un <ul> */}
          <ul className="menu menu-horizontal px-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/proyectos">Proyectos</NavLink>
            <NavLink to="/rendiciones">Rendiciones</NavLink>
            <NavLink to="/periodos">Periodos</NavLink>
            <NavLink to="/socios">Socios</NavLink>
          </ul>
        </div>

 
        {/* --- Lado Derecho: Dropdown de Usuario --- */}
        {/* --- CORREGIDO: class -> className --- */}
        <div className="navbar-end">
          {/* --- CORREGIDO: class -> className --- */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              // --- CORREGIDO: class -> className ---
              className="btn btn-ghost"
            >
              {/* --- CORREGIDO: class -> className --- */}
              <div className="flex flex-col items-end">
                {/* --- CORREGIDO: class -> className --- */}
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
              // (Esta ya estaba bien)
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

      {/* 3. Contenido Principal */}
      {/* (Esta ya estaba bien) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="bg-base-100 rounded-box shadow p-4 sm:p-6 min-h-[80vh]">
          {children}
        </div>
      </main>
    </div>
  );
}