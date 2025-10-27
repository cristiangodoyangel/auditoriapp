import React, { useEffect, useState } from 'react';

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos aún';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    setLoading(true);
    fetch('http://localhost:8000/api/proyectos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setProyectos(data);
        setLoading(false);
      })
      .catch(() => {
        setProyectos([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 ">
      {/* Cards de montos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <div className="col-span-3 text-center text-taupe">Cargando...</div>
        ) : (() => {
          let montoAsignado = 0;
          let montoRendido = 0;
          let montoPorRendir = 0;
          if (proyectos && proyectos.length > 0) {
            montoAsignado = proyectos.reduce((acc, p) => acc + (parseFloat(p.presupuesto_total) || 0), 0);
            montoRendido = proyectos.reduce((acc, p) => acc + (parseFloat(p.total_rendido) || 0), 0);
            montoPorRendir = montoAsignado - montoRendido;
          }
          return (
            <>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center border border-gray-200">
                <div className="font-semibold text-taupe h-8 flex items-center justify-center">Monto Asignado</div>
                <div className="text-2xl font-bold text-indigo h-8 flex items-center justify-center">${formatMonto(montoAsignado)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center border border-gray-200">
                <div className="font-semibold text-taupe h-8 flex items-center justify-center">Monto Rendido</div>
                <div className="text-2xl font-bold text-green-600 h-8 flex items-center justify-center">${formatMonto(montoRendido)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center border border-gray-200">
                <div className="font-semibold text-taupe h-8 flex items-center justify-center">Monto por Rendir</div>
                <div className="text-2xl font-bold text-orange-600 h-8 flex items-center justify-center">${formatMonto(montoPorRendir)}</div>
              </div>
            </>
          );
        })()}
      </div>
      <h2 className="text-2xl font-bold text-deep-purple"></h2>
      <p className="text-taupe"></p>

      {/* Cards resumen de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <div className="col-span-4 text-center text-taupe">Cargando...</div>
        ) : proyectos ? (
          <>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
                <div className="font-semibold text-taupe h-8 flex items-center justify-center">Proyectos Totales</div>
                <div className="text-2xl font-bold text-taupe h-8 flex items-center justify-center">{proyectos.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
                <div className="font-semibold text-taupe h-8 flex items-center justify-center">Proyectos Aprobados</div>
                <div className="text-2xl font-bold text-taupe h-8 flex items-center justify-center">{proyectos.filter(p => p.estado === 'Aprobado').length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
                <div className="font-semibold text-taupe h-8 flex items-center justify-center">Proyectos Pendientes</div>
                <div className="text-2xl font-bold text-taupe h-8 flex items-center justify-center">{proyectos.filter(p => p.estado === 'Pendiente').length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
                <div className="font-semibold text-taupe h-8 flex items-center justify-center">Proyectos Rechazados</div>
                <div className="text-2xl font-bold text-taupe h-8 flex items-center justify-center">{proyectos.filter(p => p.estado === 'Rechazado').length}</div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center text-taupe">Sin datos aún</div>
        )}
      </div>

      {/* KPIs eliminados por revertir lógica. */}
      {/* ...existing code... */}
      {/* Progreso Presupuestario eliminado por revertir lógica. */}
      {/* ...existing code... */}
      {/* Proyectos Recientes */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-6">
        <div className="font-bold text-deep-purple mb-2">Proyectos Recientes</div>
        <div className="text-taupe mb-4">Últimos proyectos en gestión</div>
        {loading ? (
          <div className="text-center text-taupe">Cargando...</div>
        ) : proyectos && proyectos.length > 0 ? (
          <div className="space-y-4">
            {proyectos.map((p, idx) => {
              const porcentaje = p.presupuesto > 0 ? Math.round((p.rendido / p.presupuesto) * 100) : 0;
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-deep-purple">{p.nombre || 'Sin datos aún'}</div>
                    <span className={`px-3 py-1 rounded-lg text-white text-xs font-bold ${p.estado === 'Activo' ? 'bg-indigo' : 'bg-taupe'}`}>{p.estado || 'Sin datos aún'}</span>
                  </div>
                  <div className="text-sm text-taupe">Presupuesto: {p.presupuesto ? `$${formatMonto(p.presupuesto)}` : 'Sin datos aún'}</div>
                  <div className="text-sm text-taupe">Rendido: {p.rendido ? `$${formatMonto(p.rendido)}` : 'Sin datos aún'}</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-indigo rounded-full" style={{ width: `${porcentaje}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-indigo font-bold">{porcentaje ? `${porcentaje}%` : 'Sin datos aún'}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-taupe">Sin datos aún</div>
        )}
      </div>
    </div>
  );
}
