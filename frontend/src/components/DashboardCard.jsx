import React from 'react';

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos aún';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function DashboardCard({ titulo, monto, color = 'indigo' }) {
  const colorClass = {
    indigo: 'text-indigo',
    green: 'text-green-600',
    orange: 'text-orange-600',
    taupe: 'text-taupe',
  }[color] || 'text-indigo';

  return (
    <div className={"bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center border border-gray-200 dashboard-card-hover"}>
      <div className="font-semibold text-taupe h-8 flex items-center justify-center mb-2">{titulo}</div>
      <div className={`text-2xl font-bold h-8 flex items-center justify-center ${colorClass}`}>${formatMonto(monto)}</div>
    </div>
  );
}
