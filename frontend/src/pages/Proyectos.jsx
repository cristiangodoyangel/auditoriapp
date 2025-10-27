import React, { useEffect, useState } from 'react';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    // fetch('/api/proyectos').then(res => res.json()).then(data => setProyectos(data));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-secondary text-2xl font-bold">Gestión de Proyectos</h2>
      <p className="text-taupe">Creación, seguimiento y rendición de proyectos comunitarios</p>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPIs reales aquí */}
      </div>
      {/* Lista de proyectos */}
      <div className="space-y-4 mt-6">
        {/* Renderizar proyectos reales aquí */}
      </div>
    </div>
  );
}
