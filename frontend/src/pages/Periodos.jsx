import React, { useEffect, useState } from 'react';

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);

  useEffect(() => {
    // fetch('/api/periodos').then(res => res.json()).then(data => setPeriodos(data));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-secondary text-2xl font-bold">Periodos Financieros</h2>
      <p className="text-taupe">Gestión de periodos y asignaciones presupuestarias</p>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPIs reales aquí */}
      </div>
      {/* Lista de periodos */}
      <div className="space-y-4 mt-6">
        {/* Renderizar periodos reales aquí */}
      </div>
    </div>
  );
}
