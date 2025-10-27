import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  // Estado para los datos reales
  const [stats, setStats] = useState(null);
  const [proyectosRecientes, setProyectosRecientes] = useState([]);

  useEffect(() => {
    // Aquí deberías hacer la petición al backend para obtener los datos
    // Ejemplo:
    // fetch('/api/dashboard').then(res => res.json()).then(data => {
    //   setStats(data.stats);
    //   setProyectosRecientes(data.proyectosRecientes);
    // });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-secondary text-2xl font-bold">Dashboard</h2>
      <p className="text-taupe">Resumen general de la gestión financiera</p>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Aquí se mostrarán los KPIs reales */}
      </div>
      {/* Progreso */}
      <div className="bg-card rounded-lg shadow p-4 mt-6 border border-secondary">
        <div className="font-semibold text-secondary mb-2">Progreso de Ejecución Presupuestaria</div>
        {/* Barra de progreso y datos reales */}
      </div>
      {/* Proyectos Recientes */}
      <div className="bg-card rounded-lg shadow p-4 mt-6 border border-secondary">
        <div className="font-semibold text-secondary mb-2">Proyectos Recientes</div>
        <div className="space-y-2">
          {/* Aquí se mostrarán los proyectos recientes reales */}
        </div>
      </div>
    </div>
  );
}
