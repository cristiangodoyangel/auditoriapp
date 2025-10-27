import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const sidebarItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Proyectos', path: '/proyectos' },
  { name: 'Socios', path: '/socios' },
  { name: 'Periodos', path: '/periodos' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
  <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
  <header className="bg-secondary text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="font-bold text-xl">SaaS Gestión - Comunidades Lickanantay</h1>
          <p className="text-blush text-sm">Financiado por Albemarle</p>
        </div>
        <button className="bg-taupe text-white px-4 py-2 rounded shadow">Salir</button>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-secondary text-white border-r border-border p-4 hidden md:block">
          <nav className="space-y-2">
            {sidebarItems.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blush hover:text-white transition-colors"
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 bg-background border-2 border-secondary rounded-lg m-6 shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
