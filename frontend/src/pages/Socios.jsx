import React, { useEffect, useState } from 'react';

export default function Socios() {
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    // fetch('/api/socios').then(res => res.json()).then(data => setSocios(data));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-secondary text-2xl font-bold">Gestión de Socios</h2>
      <p className="text-taupe">Registro y control de socios de la comunidad</p>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPIs reales aquí */}
      </div>
      {/* Tabla de socios */}
      <div className="bg-card rounded-lg shadow p-4 mt-6 border border-secondary">
        <div className="font-bold text-secondary mb-2">Socios Registrados</div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-secondary">
              <th>Nombre</th>
              <th>RUT</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderizar socios reales aquí */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
