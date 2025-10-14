import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../services/authService';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema Auditoría - Comunidades Lickanantay
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.nombre} ({user?.rol})
                {user?.comunidad && ` - ${user.comunidad.nombre}`}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/proyectos" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Proyectos
                </Link>
              </li>
              <li>
                <Link 
                  to="/socios" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Socios
                </Link>
              </li>
              {(user?.rol === 'Admin Consejo' || user?.rol === 'Auditor') && (
                <>
                  <li>
                    <Link 
                      to="/revision-documentos" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Revisión
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link 
                  to="/documentos" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Documentos
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;