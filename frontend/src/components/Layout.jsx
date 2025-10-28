import React, { useState } from 'react';
import logo from '../assets/logo.ico';
import { Link, useNavigate } from 'react-router-dom';

const sidebarItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Proyectos', path: '/proyectos' },
  { name: 'Socios', path: '/socios' },
  { name: 'Periodos', path: '/periodos' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const menuRef = React.useRef();
  const buttonRef = React.useRef();

  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
  <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-indigo text-white flex flex-col py-8 px-6 border-r border-secondary min-h-screen rounded-lg">
          {/* Logo encima del menú */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Logo" className="w-26 h-26" />
          </div>
          <nav className="flex-1">
            <ul className="space-y-6">
              <li>
                <a href="/dashboard" className="hover:text-white hover:bg-taupe font-semibold rounded-lg px-2 py-1 transition">Dashboard</a>
              </li>
              <li>
                <a href="/proyectos" className="hover:text-white hover:bg-taupe font-semibold rounded-lg px-2 py-1 transition">Proyectos</a>
              </li>
              <li>
                <a href="/rendiciones" className="hover:text-white hover:bg-taupe font-semibold rounded-lg px-2 py-1 transition">Rendiciones</a>
              </li>receurad
                 <li>
                <a href="/periodos" className="hover:text-white hover:bg-taupe font-semibold rounded-lg px-2 py-1 transition">Periodos</a>
              </li>
              <li>
                <a href="/socios" className="hover:text-white hover:bg-taupe font-semibold rounded-lg px-2 py-1 transition">Socios</a>
              </li>
           
              
            </ul>
          </nav>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="bg-indigo border-secondary text-white flex items-center justify-between px-8 py-4 border-b border-secondary rounded-lg rounded-b-none">
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-bold">Gestión Comunidades</h1>
              <span className="text-blush text-lg font-semibold mt-1">
                {user?.es_auditor ? 'Auditores' : (user?.comunidad?.nombre || user?.comunidad_nombre || '')}
              </span>
            </div>
            <div className="relative ">
              <button
                ref={buttonRef}
                className="bg-taupe text-white px-4 py-2 rounded-lg shadow font-semibold flex items-center gap-2 hover:bg-taupe hover:text-white"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {user?.nombre || user?.username || 'Usuario'}
                <svg width="16" height="16" fill="currentColor" className="ml-1"><path d="M4 6l4 4 4-4"/></svg>
              </button>
              {menuOpen && (
                <div ref={menuRef} className="absolute right-0 mt-2 w-40 bg-white text-indigo rounded-lg shadow-lg border border-secondary z-10">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-taupe hover:text-white text-indigo rounded-lg"
                    onClick={handleLogout}
                  >Cerrar sesión</button>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-8 bg-background ">
            <div className="border border-secondary rounded-lg p-6 min-h-[70vh] bg-white shadow">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
